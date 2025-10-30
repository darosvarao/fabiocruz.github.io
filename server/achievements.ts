import * as db from "./db";
import { getUserByOpenId } from "./db";

/**
 * Check and unlock achievements for a user
 * This should be called after significant actions (purchase, mining, etc.)
 */
export async function checkAndUnlockAchievements(userId: number) {
  const allAchievements = await db.getAllAchievements();
  const userAchievements = await db.getUserAchievements(userId);
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
  
  // Get user stats
  const user = await db.getDb().then(db => 
    db?.select().from(require("../drizzle/schema").users).where(
      require("drizzle-orm").eq(require("../drizzle/schema").users.id, userId)
    ).limit(1)
  );
  
  if (!user || user.length === 0) return;
  const userStats = user[0];
  
  // Get user miners count
  const userMiners = await db.getUserMiners(userId);
  const minersCount = userMiners.length;
  
  // Get games played count
  const gameSessions = await db.getUserGameSessions(userId, 1000);
  const gamesPlayed = gameSessions.length;
  
  const stats = {
    total_hash_power: userStats.totalHashPower,
    total_btc: userStats.btcBalance,
    miners_owned: minersCount,
    games_played: gamesPlayed,
  };
  
  // Check each achievement
  for (const achievement of allAchievements) {
    // Skip if already unlocked
    if (unlockedIds.has(achievement.id)) continue;
    
    const currentValue = stats[achievement.requirementType as keyof typeof stats] || 0;
    
    // Check if requirement is met
    if (currentValue >= achievement.requirement) {
      // Unlock achievement
      await db.unlockAchievement(userId, achievement.id);
      
      // Award credits
      if (achievement.rewardCredits > 0) {
        await db.updateUserCredits(userId, achievement.rewardCredits);
      }
    }
  }
}
