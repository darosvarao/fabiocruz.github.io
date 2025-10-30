CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` text,
	`requirement` int NOT NULL,
	`requirementType` varchar(64) NOT NULL,
	`rewardCredits` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameType` varchar(64) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`hashPowerBonus` int NOT NULL DEFAULT 0,
	`bonusExpiresAt` timestamp NOT NULL,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `miners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`hashPower` int NOT NULL,
	`price` int NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `miners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `miningRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`btcAmount` int NOT NULL DEFAULT 0,
	`ethAmount` int NOT NULL DEFAULT 0,
	`dogeAmount` int NOT NULL DEFAULT 0,
	`hashPowerUsed` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `miningRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userMiners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`minerId` int NOT NULL,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `userMiners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `totalHashPower` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `btcBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ethBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `dogeBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 1000 NOT NULL;