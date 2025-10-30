import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Mining stats
  totalHashPower: int("totalHashPower").default(0).notNull(),
  btcBalance: int("btcBalance").default(0).notNull(), // stored in satoshis (1 BTC = 100,000,000 satoshis)
  ethBalance: int("ethBalance").default(0).notNull(), // stored in wei (1 ETH = 1,000,000,000,000,000,000 wei) - scaled down to fit int
  dogeBalance: int("dogeBalance").default(0).notNull(), // stored in koinus (1 DOGE = 100,000,000 koinus)
  credits: int("credits").default(1000).notNull(), // in-game currency for buying miners
  energy: int("energy").default(100).notNull(), // energy for playing games (max 100)
  lastEnergyUpdate: timestamp("lastEnergyUpdate").defaultNow().notNull(), // last time energy was updated
  lastAdWatched: timestamp("lastAdWatched"), // last time user watched an ad
  adsWatchedToday: int("adsWatchedToday").default(0).notNull(), // number of ads watched today
  lastAdResetDate: timestamp("lastAdResetDate").defaultNow().notNull(), // last date the daily ad counter was reset
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Miners (equipment) that users can purchase
 */
export const miners = mysqlTable("miners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  hashPower: int("hashPower").notNull(), // mining power provided
  price: int("price").notNull(), // cost in credits
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Miner = typeof miners.$inferSelect;
export type InsertMiner = typeof miners.$inferInsert;

/**
 * User's inventory of miners
 */
export const userMiners = mysqlTable("userMiners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  minerId: int("minerId").notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type UserMiner = typeof userMiners.$inferSelect;
export type InsertUserMiner = typeof userMiners.$inferInsert;

/**
 * Mining history - rewards distributed every 10 minutes
 */
export const miningRewards = mysqlTable("miningRewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  btcAmount: int("btcAmount").default(0).notNull(),
  ethAmount: int("ethAmount").default(0).notNull(),
  dogeAmount: int("dogeAmount").default(0).notNull(),
  hashPowerUsed: int("hashPowerUsed").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MiningReward = typeof miningRewards.$inferSelect;
export type InsertMiningReward = typeof miningRewards.$inferInsert;

/**
 * Achievements/Conquests
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: text("icon"),
  requirement: int("requirement").notNull(), // numeric threshold
  requirementType: varchar("requirementType", { length: 64 }).notNull(), // e.g., "total_hash_power", "total_btc", "miners_owned"
  rewardCredits: int("rewardCredits").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements tracking
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Game sessions - track when users play minigames
 */
export const gameSessions = mysqlTable("gameSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: varchar("gameType", { length: 64 }).notNull(), // "memory", "click_speed", "puzzle"
  score: int("score").default(0).notNull(),
  hashPowerBonus: int("hashPowerBonus").default(0).notNull(), // temporary boost earned
  bonusExpiresAt: timestamp("bonusExpiresAt").notNull(),
  playedAt: timestamp("playedAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
