import { eq, and, gt } from "drizzle-orm";
import { getDb } from "./db";
import { activeBoosts, users } from "../drizzle/schema";

// Boost prices and durations
export const BOOST_HASH_POWER_2X_PRICE = 500; // credits
export const BOOST_HASH_POWER_2X_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const ENERGY_REFILL_PRICE = 200; // credits
export const MAX_ENERGY = 100;

/**
 * Purchase and activate a 2x hash power boost
 */
export async function purchaseHashPowerBoost(userId: number): Promise<{
  success: boolean;
  message?: string;
  expiresAt?: Date;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const userData = user[0];

  // Check if user has enough credits
  if (userData.credits < BOOST_HASH_POWER_2X_PRICE) {
    return {
      success: false,
      message: `Insufficient credits. Need ${BOOST_HASH_POWER_2X_PRICE}, have ${userData.credits}`,
    };
  }

  // Deduct credits
  await db.update(users)
    .set({ credits: userData.credits - BOOST_HASH_POWER_2X_PRICE })
    .where(eq(users.id, userId));

  // Create boost
  const now = new Date();
  const expiresAt = new Date(now.getTime() + BOOST_HASH_POWER_2X_DURATION);

  await db.insert(activeBoosts).values({
    userId,
    boostType: "hash_power_2x",
    multiplier: 2,
    activatedAt: now,
    expiresAt,
  });

  return {
    success: true,
    expiresAt,
  };
}

/**
 * Purchase energy refill (instant full energy)
 */
export async function purchaseEnergyRefill(userId: number): Promise<{
  success: boolean;
  message?: string;
  newEnergy?: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const userData = user[0];

  // Check if user has enough credits
  if (userData.credits < ENERGY_REFILL_PRICE) {
    return {
      success: false,
      message: `Insufficient credits. Need ${ENERGY_REFILL_PRICE}, have ${userData.credits}`,
    };
  }

  // Check if energy is already full
  if (userData.energy >= MAX_ENERGY) {
    return {
      success: false,
      message: "Energy is already full",
    };
  }

  // Deduct credits and refill energy
  await db.update(users)
    .set({
      credits: userData.credits - ENERGY_REFILL_PRICE,
      energy: MAX_ENERGY,
      lastEnergyUpdate: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    newEnergy: MAX_ENERGY,
  };
}

/**
 * Get active boosts for a user
 */
export async function getActiveBoosts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  // Get all active boosts that haven't expired
  const boosts = await db.select()
    .from(activeBoosts)
    .where(
      and(
        eq(activeBoosts.userId, userId),
        gt(activeBoosts.expiresAt, now)
      )
    );

  return boosts;
}

/**
 * Get current hash power multiplier from active boosts
 */
export async function getHashPowerMultiplier(userId: number): Promise<number> {
  const boosts = await getActiveBoosts(userId);
  
  // Find the highest multiplier from hash_power boosts
  let maxMultiplier = 1;
  for (const boost of boosts) {
    if (boost.boostType === "hash_power_2x" && boost.multiplier > maxMultiplier) {
      maxMultiplier = boost.multiplier;
    }
  }
  
  return maxMultiplier;
}

/**
 * Clean up expired boosts
 */
export async function cleanupExpiredBoosts(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  await db.delete(activeBoosts)
    .where(
      and(
        eq(activeBoosts.userId, userId),
        gt(activeBoosts.expiresAt, now)
      )
    );
}
