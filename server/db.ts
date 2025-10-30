import { eq, desc, and, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  miners, Miner, InsertMiner,
  userMiners, UserMiner, InsertUserMiner,
  miningRewards, MiningReward, InsertMiningReward,
  achievements, Achievement, InsertAchievement,
  userAchievements, UserAchievement, InsertUserAchievement,
  gameSessions, GameSession, InsertGameSession
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== MINERS =====

export async function getAllMiners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(miners);
}

export async function getMinerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(miners).where(eq(miners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMiner(miner: InsertMiner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(miners).values(miner);
  return result;
}

// ===== USER MINERS =====

export async function getUserMiners(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: userMiners.id,
      userId: userMiners.userId,
      minerId: userMiners.minerId,
      purchasedAt: userMiners.purchasedAt,
      isActive: userMiners.isActive,
      miner: miners,
    })
    .from(userMiners)
    .leftJoin(miners, eq(userMiners.minerId, miners.id))
    .where(eq(userMiners.userId, userId));
  
  return result;
}

export async function purchaseMiner(userId: number, minerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userMiners).values({
    userId,
    minerId,
  });
  
  return result;
}

export async function calculateUserHashPower(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  // Get all active miners
  const userMinersData = await db
    .select({
      hashPower: miners.hashPower,
    })
    .from(userMiners)
    .leftJoin(miners, eq(userMiners.minerId, miners.id))
    .where(and(
      eq(userMiners.userId, userId),
      eq(userMiners.isActive, true)
    ));
  
  // Get active game bonuses
  const now = new Date();
  const activeBonuses = await db
    .select({
      hashPowerBonus: gameSessions.hashPowerBonus,
    })
    .from(gameSessions)
    .where(and(
      eq(gameSessions.userId, userId),
      gte(gameSessions.bonusExpiresAt, now)
    ));
  
  const minerPower = userMinersData.reduce((sum, m) => sum + (m.hashPower || 0), 0);
  const bonusPower = activeBonuses.reduce((sum, b) => sum + (b.hashPowerBonus || 0), 0);
  
  return minerPower + bonusPower;
}

export async function updateUserHashPower(userId: number, hashPower: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ totalHashPower: hashPower })
    .where(eq(users.id, userId));
}

// ===== MINING REWARDS =====

export async function createMiningReward(reward: InsertMiningReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(miningRewards).values(reward);
  return result;
}

export async function getUserMiningHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(miningRewards)
    .where(eq(miningRewards.userId, userId))
    .orderBy(desc(miningRewards.timestamp))
    .limit(limit);
}

export async function updateUserBalance(userId: number, btc: number, eth: number, doge: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({
      btcBalance: sql`${users.btcBalance} + ${btc}`,
      ethBalance: sql`${users.ethBalance} + ${eth}`,
      dogeBalance: sql`${users.dogeBalance} + ${doge}`,
    })
    .where(eq(users.id, userId));
}

export async function updateUserCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({
      credits: sql`${users.credits} + ${amount}`,
    })
    .where(eq(users.id, userId));
}

// ===== ACHIEVEMENTS =====

export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(achievements);
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      unlockedAt: userAchievements.unlockedAt,
      achievement: achievements,
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
  
  return result;
}

export async function unlockAchievement(userId: number, achievementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already unlocked
  const existing = await db
    .select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return null; // Already unlocked
  }
  
  const result = await db.insert(userAchievements).values({
    userId,
    achievementId,
  });
  
  return result;
}

// ===== GAME SESSIONS =====

export async function createGameSession(session: InsertGameSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(gameSessions).values(session);
  return result;
}

export async function getUserGameSessions(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.userId, userId))
    .orderBy(desc(gameSessions.playedAt))
    .limit(limit);
}
