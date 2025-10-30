CREATE TABLE `activeBoosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`boostType` enum('hash_power_2x','energy_refill') NOT NULL,
	`multiplier` int NOT NULL DEFAULT 1,
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `activeBoosts_id` PRIMARY KEY(`id`)
);
