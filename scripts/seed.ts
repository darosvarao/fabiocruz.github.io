import { drizzle } from "drizzle-orm/mysql2";
import { miners, achievements } from "../drizzle/schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("Seeding miners...");
  
  const minersData = [
    { name: "CPU Miner", description: "Basic CPU mining rig. Perfect for beginners.", hashPower: 10, price: 100, rarity: "common" as const, imageUrl: null },
    { name: "GPU Starter", description: "Entry-level GPU miner with decent performance.", hashPower: 25, price: 250, rarity: "common" as const, imageUrl: null },
    { name: "ASIC Lite", description: "Lightweight ASIC miner for efficient mining.", hashPower: 50, price: 500, rarity: "common" as const, imageUrl: null },
    { name: "Dual GPU Rig", description: "Powerful dual GPU setup for serious miners.", hashPower: 100, price: 1200, rarity: "rare" as const, imageUrl: null },
    { name: "ASIC Pro", description: "Professional-grade ASIC with high efficiency.", hashPower: 200, price: 2500, rarity: "rare" as const, imageUrl: null },
    { name: "Mining Farm Mini", description: "Compact mining farm with multiple units.", hashPower: 350, price: 4000, rarity: "rare" as const, imageUrl: null },
    { name: "Quantum Miner", description: "Experimental quantum computing miner.", hashPower: 750, price: 8000, rarity: "epic" as const, imageUrl: null },
    { name: "Data Center Rack", description: "Full rack of mining equipment.", hashPower: 1500, price: 15000, rarity: "epic" as const, imageUrl: null },
    { name: "Crypto Fortress", description: "Legendary mining fortress with unmatched power.", hashPower: 5000, price: 50000, rarity: "legendary" as const, imageUrl: null },
    { name: "Satoshi's Legacy", description: "The ultimate mining machine.", hashPower: 10000, price: 100000, rarity: "legendary" as const, imageUrl: null },
  ];

  await db.insert(miners).values(minersData);
  console.log("Inserted miners");

  const achievementsData = [
    { name: "First Steps", description: "Purchase your first miner", icon: "🎯", requirement: 1, requirementType: "miners_owned", rewardCredits: 100 },
    { name: "Getting Serious", description: "Own 5 miners", icon: "⚡", requirement: 5, requirementType: "miners_owned", rewardCredits: 500 },
    { name: "Mining Tycoon", description: "Own 10 miners", icon: "💎", requirement: 10, requirementType: "miners_owned", rewardCredits: 1000 },
    { name: "Hash Power 100", description: "Reach 100 total hash power", icon: "🔥", requirement: 100, requirementType: "total_hash_power", rewardCredits: 200 },
    { name: "Hash Power 1000", description: "Reach 1000 total hash power", icon: "⚡", requirement: 1000, requirementType: "total_hash_power", rewardCredits: 1000 },
    { name: "Bitcoin Beginner", description: "Earn 10000 satoshis", icon: "₿", requirement: 10000, requirementType: "total_btc", rewardCredits: 300 },
    { name: "Game Master", description: "Play 10 minigames", icon: "🎮", requirement: 10, requirementType: "games_played", rewardCredits: 500 },
  ];

  await db.insert(achievements).values(achievementsData);
  console.log("Seeding complete");
  process.exit(0);
}

seed().catch(console.error);
