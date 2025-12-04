CREATE TABLE `allergies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `allergies_id` PRIMARY KEY(`id`),
	CONSTRAINT `allergies_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `dishwasherFoodPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dishwasherProfileId` int NOT NULL,
	`specialtyId` int NOT NULL,
	`preferenceLevel` enum('love','like','neutral') NOT NULL DEFAULT 'like',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dishwasherFoodPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dishwasherProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workRangeKm` int NOT NULL DEFAULT 10,
	`hourlyRateDishes` int NOT NULL DEFAULT 0,
	`experienceYears` int NOT NULL DEFAULT 0,
	`availabilitySchedule` json,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`totalDishesDone` int NOT NULL DEFAULT 0,
	`averageRating` int NOT NULL DEFAULT 0,
	`totalRatings` int NOT NULL DEFAULT 0,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`city` varchar(100),
	`state` varchar(100),
	`country` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dishwasherProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foodSpecialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodSpecialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `foodSpecialties_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `hostFoodSpecialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostProfileId` int NOT NULL,
	`specialtyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hostFoodSpecialties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hostProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`addressLine1` varchar(255) NOT NULL,
	`addressLine2` varchar(255),
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`postalCode` varchar(20) NOT NULL,
	`country` varchar(100) NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`typicalDishCount` int NOT NULL DEFAULT 0,
	`kitchenSize` enum('small','medium','large') NOT NULL DEFAULT 'medium',
	`hasDishwasherMachine` boolean NOT NULL DEFAULT false,
	`averageRating` int NOT NULL DEFAULT 0,
	`totalRatings` int NOT NULL DEFAULT 0,
	`totalSessionsHosted` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hostProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`dishwasherId` int NOT NULL,
	`matchScore` int,
	`status` enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`messageText` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profilePhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`displayOrder` int NOT NULL DEFAULT 0,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profilePhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`raterId` int NOT NULL,
	`ratedId` int NOT NULL,
	`rating` int NOT NULL,
	`reviewText` text,
	`punctualityRating` int,
	`qualityRating` int,
	`friendlinessRating` int,
	`wouldRecommend` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostId` int NOT NULL,
	`dishwasherId` int,
	`status` enum('open','matched','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
	`scheduledDate` timestamp NOT NULL,
	`estimatedDurationMinutes` int NOT NULL DEFAULT 60,
	`actualDurationMinutes` int,
	`dishCount` int,
	`mealDescription` text,
	`specialInstructions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAllergies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`allergyId` int NOT NULL,
	`severity` enum('mild','moderate','severe') NOT NULL DEFAULT 'moderate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAllergies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('dishwasher','host','both') DEFAULT 'dishwasher' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;