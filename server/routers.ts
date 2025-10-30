import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { checkAndUnlockAchievements } from "./achievements";
import { updateUserEnergy, consumeEnergy, getTimeUntilNextEnergy, getTimeUntilFullEnergy, MAX_ENERGY, ENERGY_COST_PER_GAME } from "./energy";
import { canWatchAd, watchAd, getTimeUntilNextAd, AD_REWARD_CREDITS, MAX_ADS_PER_DAY } from "./ads";
import { purchaseHashPowerBoost, purchaseEnergyRefill, getActiveBoosts, getHashPowerMultiplier, BOOST_HASH_POWER_2X_PRICE, ENERGY_REFILL_PRICE } from "./boosts";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User stats and profile
  user: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      // Calculate base hash power
      const baseHashPower = await db.calculateUserHashPower(user.id);
      
      // Apply hash power multiplier from boosts
      const multiplier = await getHashPowerMultiplier(user.id);
      const currentHashPower = Math.floor(baseHashPower * multiplier);
      
      // Update if changed
      if (baseHashPower !== user.totalHashPower) {
        await db.updateUserHashPower(user.id, baseHashPower);
      }
      
      // Update and get current energy
      const currentEnergy = await updateUserEnergy(user.id);
      const timeUntilNextEnergy = getTimeUntilNextEnergy(new Date(user.lastEnergyUpdate));
      const timeUntilFullEnergy = getTimeUntilFullEnergy(currentEnergy, new Date(user.lastEnergyUpdate));
      
      // Get ad status
      const adStatus = await canWatchAd(user.id);
      const timeUntilNextAd = user.lastAdWatched ? getTimeUntilNextAd(new Date(user.lastAdWatched)) : 0;
      
      // Get active boosts
      const activeBoosts = await getActiveBoosts(user.id);
      const hashPowerMultiplier = await getHashPowerMultiplier(user.id);
      
      return {
        id: user.id,
        name: user.name,
        totalHashPower: currentHashPower,
        btcBalance: user.btcBalance,
        ethBalance: user.ethBalance,
        dogeBalance: user.dogeBalance,
        credits: user.credits,
        energy: currentEnergy,
        maxEnergy: MAX_ENERGY,
        energyCostPerGame: ENERGY_COST_PER_GAME,
        timeUntilNextEnergy,
        timeUntilFullEnergy,
        canWatchAd: adStatus.canWatch,
        adsWatchedToday: adStatus.adsWatchedToday || 0,
        maxAdsPerDay: MAX_ADS_PER_DAY,
        adRewardCredits: AD_REWARD_CREDITS,
        timeUntilNextAd,
        activeBoosts,
        hashPowerMultiplier,
        boostHashPower2xPrice: BOOST_HASH_POWER_2X_PRICE,
        energyRefillPrice: ENERGY_REFILL_PRICE,
      };
    }),
  }),

  // Miners shop and inventory
  miners: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllMiners();
    }),
    
    getUserMiners: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      return await db.getUserMiners(user.id);
    }),
    
    purchase: protectedProcedure
      .input(z.object({
        minerId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        const miner = await db.getMinerById(input.minerId);
        if (!miner) throw new TRPCError({ code: "NOT_FOUND", message: "Miner not found" });
        
        if (user.credits < miner.price) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient credits" });
        }
        
        // Deduct credits
        await db.updateUserCredits(user.id, -miner.price);
        
        // Add miner to inventory
        await db.purchaseMiner(user.id, input.minerId);
        
        // Update hash power
        const newHashPower = await db.calculateUserHashPower(user.id);
        await db.updateUserHashPower(user.id, newHashPower);
        
        // Check achievements
        await checkAndUnlockAchievements(user.id);
        
        return { success: true };
      }),
  }),

  // Mining rewards
  mining: router({
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        return await db.getUserMiningHistory(user.id, input.limit);
      }),
    
    claimReward: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      const hashPower = await db.calculateUserHashPower(user.id);
      
      if (hashPower === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No mining power available" });
      }
      
      // Simple reward calculation (can be made more complex)
      // Base reward per hash power unit
      const btcReward = Math.floor(hashPower * 10); // satoshis
      const ethReward = Math.floor(hashPower * 100); // scaled wei
      const dogeReward = Math.floor(hashPower * 1000); // koinus
      
      // Create reward record
      await db.createMiningReward({
        userId: user.id,
        btcAmount: btcReward,
        ethAmount: ethReward,
        dogeAmount: dogeReward,
        hashPowerUsed: hashPower,
      });
      
      // Update user balances
      await db.updateUserBalance(user.id, btcReward, ethReward, dogeReward);
      
      // Check achievements
      await checkAndUnlockAchievements(user.id);
      
      return {
        btcReward,
        ethReward,
        dogeReward,
        hashPower,
      };
    }),
  }),

  // Games
  games: router({
    startGame: protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        // Consume energy when starting game
        const energyResult = await consumeEnergy(user.id);
        if (!energyResult.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: energyResult.message || "Insufficient energy" });
        }
        
        return {
          success: true,
          newEnergy: energyResult.newEnergy,
        };
      }),
    
    submitScore: protectedProcedure
      .input(z.object({
        gameType: z.enum(["memory", "click_speed", "puzzle"]),
        score: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        // Energy is now consumed when starting the game, not when submitting score
        
        // Calculate bonus based on score and game type
        let hashPowerBonus = 0;
        const bonusDuration = 30 * 60 * 1000; // 30 minutes
        
        switch (input.gameType) {
          case "memory":
            hashPowerBonus = Math.floor(input.score / 10);
            break;
          case "click_speed":
            hashPowerBonus = Math.floor(input.score / 5);
            break;
          case "puzzle":
            hashPowerBonus = Math.floor(input.score / 8);
            break;
        }
        
        const bonusExpiresAt = new Date(Date.now() + bonusDuration);
        
        await db.createGameSession({
          userId: user.id,
          gameType: input.gameType,
          score: input.score,
          hashPowerBonus,
          bonusExpiresAt,
        });
        
        // Check achievements
        await checkAndUnlockAchievements(user.id);
        
        return {
          hashPowerBonus,
          bonusExpiresAt,
        };
      }),
    
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        return await db.getUserGameSessions(user.id, input.limit);
      }),
  }),

  // Boosts and Power-ups
  boosts: router({
    getActive: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      return await getActiveBoosts(user.id);
    }),
    
    purchaseHashPower2x: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      const result = await purchaseHashPowerBoost(user.id);
      
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.message });
      }
      
      return result;
    }),
    
    purchaseEnergyRefill: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      const result = await purchaseEnergyRefill(user.id);
      
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.message });
      }
      
      return result;
    }),
  }),

  // Ads
  ads: router({
    canWatch: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      return await canWatchAd(user.id);
    }),
    
    watch: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      const result = await watchAd(user.id);
      
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.message });
      }
      
      return result;
    }),
  }),

  // Achievements
  achievements: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllAchievements();
    }),
    
    getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      return await db.getUserAchievements(user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
