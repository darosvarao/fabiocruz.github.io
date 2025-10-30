ALTER TABLE `users` ADD `lastAdWatched` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `adsWatchedToday` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastAdResetDate` timestamp DEFAULT (now()) NOT NULL;