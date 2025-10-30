ALTER TABLE `users` ADD `energy` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastEnergyUpdate` timestamp DEFAULT (now()) NOT NULL;