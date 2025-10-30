import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../drizzle/schema";

const AD_COOLDOWN_MINUTES = 5; // 5 minutes between ads
const AD_REWARD_CREDITS = 100; // credits earned per ad
const MAX_ADS_PER_DAY = 20; // maximum ads per day

/**
 * Check if user can watch an ad
 */
export async function canWatchAd(userId: number): Promise<{
  canWatch: boolean;
  reason?: string;
  timeUntilNext?: number;
  adsWatchedToday?: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const userData = user[0];
  const now = new Date();

  // Reset daily counter if it's a new day
  const lastReset = new Date(userData.lastAdResetDate);
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  if (isNewDay) {
    await db.update(users)
      .set({
        adsWatchedToday: 0,
        lastAdResetDate: now,
      })
      .where(eq(users.id, userId));
    
    return {
      canWatch: true,
      adsWatchedToday: 0,
    };
  }

  // Check daily limit
  if (userData.adsWatchedToday >= MAX_ADS_PER_DAY) {
    return {
      canWatch: false,
      reason: `Daily limit reached (${MAX_ADS_PER_DAY} ads per day)`,
      adsWatchedToday: userData.adsWatchedToday,
    };
  }

  // Check cooldown
  if (userData.lastAdWatched) {
    const lastWatched = new Date(userData.lastAdWatched);
    const minutesSinceLastAd = (now.getTime() - lastWatched.getTime()) / (1000 * 60);

    if (minutesSinceLastAd < AD_COOLDOWN_MINUTES) {
      const secondsUntilNext = Math.ceil((AD_COOLDOWN_MINUTES - minutesSinceLastAd) * 60);
      return {
        canWatch: false,
        reason: `Please wait ${Math.ceil(AD_COOLDOWN_MINUTES - minutesSinceLastAd)} more minutes`,
        timeUntilNext: secondsUntilNext,
        adsWatchedToday: userData.adsWatchedToday,
      };
    }
  }

  return {
    canWatch: true,
    adsWatchedToday: userData.adsWatchedToday,
  };
}

/**
 * Record that user watched an ad and give reward
 */
export async function watchAd(userId: number): Promise<{
  success: boolean;
  creditsEarned?: number;
  newBalance?: number;
  message?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user can watch ad
  const canWatch = await canWatchAd(userId);
  if (!canWatch.canWatch) {
    return {
      success: false,
      message: canWatch.reason,
    };
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const userData = user[0];
  const now = new Date();

  // Update user
  const newCredits = userData.credits + AD_REWARD_CREDITS;
  const newAdsWatched = userData.adsWatchedToday + 1;

  await db.update(users)
    .set({
      credits: newCredits,
      lastAdWatched: now,
      adsWatchedToday: newAdsWatched,
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    creditsEarned: AD_REWARD_CREDITS,
    newBalance: newCredits,
  };
}

/**
 * Get time until next ad is available
 */
export function getTimeUntilNextAd(lastAdWatched: Date | null): number {
  if (!lastAdWatched) return 0;

  const now = new Date();
  const minutesSinceLastAd = (now.getTime() - lastAdWatched.getTime()) / (1000 * 60);

  if (minutesSinceLastAd >= AD_COOLDOWN_MINUTES) return 0;

  return Math.ceil((AD_COOLDOWN_MINUTES - minutesSinceLastAd) * 60); // return in seconds
}

export { AD_COOLDOWN_MINUTES, AD_REWARD_CREDITS, MAX_ADS_PER_DAY };
