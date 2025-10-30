import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../drizzle/schema";

const MAX_ENERGY = 100;
const ENERGY_RECHARGE_RATE = 1; // 1 energy per minute
const ENERGY_COST_PER_GAME = 20; // cost to play one game

/**
 * Calculate and update user's current energy based on time passed
 */
export async function updateUserEnergy(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const userData = user[0];
  const now = new Date();
  const lastUpdate = new Date(userData.lastEnergyUpdate);
  const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

  if (minutesPassed > 0 && userData.energy < MAX_ENERGY) {
    const energyToAdd = Math.min(minutesPassed * ENERGY_RECHARGE_RATE, MAX_ENERGY - userData.energy);
    const newEnergy = Math.min(userData.energy + energyToAdd, MAX_ENERGY);

    await db.update(users)
      .set({
        energy: newEnergy,
        lastEnergyUpdate: now,
      })
      .where(eq(users.id, userId));

    return newEnergy;
  }

  return userData.energy;
}

/**
 * Consume energy when playing a game
 */
export async function consumeEnergy(userId: number): Promise<{ success: boolean; newEnergy: number; message?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // First update energy based on time passed
  const currentEnergy = await updateUserEnergy(userId);

  if (currentEnergy < ENERGY_COST_PER_GAME) {
    return {
      success: false,
      newEnergy: currentEnergy,
      message: `Insufficient energy. Need ${ENERGY_COST_PER_GAME}, have ${currentEnergy}`,
    };
  }

  const newEnergy = currentEnergy - ENERGY_COST_PER_GAME;

  await db.update(users)
    .set({
      energy: newEnergy,
      lastEnergyUpdate: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    newEnergy,
  };
}

/**
 * Get time until next energy point
 */
export function getTimeUntilNextEnergy(lastUpdate: Date): number {
  const now = new Date();
  const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
  const timePerEnergy = 60 * 1000; // 1 minute in milliseconds
  const timeUntilNext = timePerEnergy - (timeSinceUpdate % timePerEnergy);
  
  return Math.ceil(timeUntilNext / 1000); // return in seconds
}

/**
 * Get time until full energy
 */
export function getTimeUntilFullEnergy(currentEnergy: number, lastUpdate: Date): number {
  if (currentEnergy >= MAX_ENERGY) return 0;
  
  const energyNeeded = MAX_ENERGY - currentEnergy;
  const minutesNeeded = energyNeeded / ENERGY_RECHARGE_RATE;
  
  const now = new Date();
  const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
  const minutesSinceUpdate = timeSinceUpdate / (1000 * 60);
  const partialProgress = minutesSinceUpdate % 1;
  
  const totalMinutes = minutesNeeded - partialProgress;
  return Math.ceil(totalMinutes * 60); // return in seconds
}

export { MAX_ENERGY, ENERGY_COST_PER_GAME };
