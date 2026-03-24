-- MySQL dump 10.13  Distrib 8.4.8, for Linux (x86_64)
--
-- Host: localhost    Database: liscord
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `channel_emojis`
--

DROP TABLE IF EXISTS `channel_emojis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_emojis` (
  `channel_id` varchar(36) NOT NULL,
  `emoji_id` varchar(36) NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`channel_id`,`emoji_id`),
  KEY `fk_channel_emojis_emoji` (`emoji_id`),
  CONSTRAINT `fk_channel_emojis_channel` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`channel_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_channel_emojis_emoji` FOREIGN KEY (`emoji_id`) REFERENCES `emojis` (`emoji_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_emojis`
--

LOCK TABLES `channel_emojis` WRITE;
/*!40000 ALTER TABLE `channel_emojis` DISABLE KEYS */;
/*!40000 ALTER TABLE `channel_emojis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `channel_id` varchar(36) NOT NULL,
  `channel_name` varchar(255) NOT NULL,
  `type` enum('text','voice') NOT NULL DEFAULT 'text',
  `position` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `server_id` varchar(36) NOT NULL,
  PRIMARY KEY (`channel_id`),
  KEY `fk_channel_server1_idx` (`server_id`),
  CONSTRAINT `fk_channel_server1` FOREIGN KEY (`server_id`) REFERENCES `servers` (`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES ('07cf2f88-15e8-42ac-84dd-e4e72561a36c','gaming','text',1,'2026-03-20 05:25:51','210f6e07-8cd5-4fe3-92d3-73d6854d4393'),('b05e18a1-89ba-4fbe-8a19-4107a9f213c2','general','text',0,'2026-03-19 14:59:49','210f6e07-8cd5-4fe3-92d3-73d6854d4393');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emojis`
--

DROP TABLE IF EXISTS `emojis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emojis` (
  `emoji_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `unicode` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` varchar(36) DEFAULT NULL,
  `server_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`emoji_id`),
  KEY `idx_server` (`server_id`),
  KEY `fk_emoji_user` (`created_by`),
  CONSTRAINT `fk_emoji_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`server_id`),
  CONSTRAINT `fk_emoji_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emojis`
--

LOCK TABLES `emojis` WRITE;
/*!40000 ALTER TABLE `emojis` DISABLE KEYS */;
/*!40000 ALTER TABLE `emojis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `user_id` varchar(36) NOT NULL,
  `friend_id` varchar(36) NOT NULL,
  `status` enum('pending','accepted','blocked') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`friend_id`,`user_id`),
  KEY `fk_friend_users1_idx` (`user_id`),
  KEY `fk_friend_users2_idx` (`friend_id`),
  CONSTRAINT `fk_friend_users1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_friend_users2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invites`
--

DROP TABLE IF EXISTS `invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invites` (
  `invite_id` varchar(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `server_id` varchar(36) NOT NULL,
  `created_by` varchar(36) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `uses` int DEFAULT '0',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invite_id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_server` (`server_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `invites_ibfk_1` FOREIGN KEY (`server_id`) REFERENCES `servers` (`server_id`) ON DELETE CASCADE,
  CONSTRAINT `invites_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invites`
--

LOCK TABLES `invites` WRITE;
/*!40000 ALTER TABLE `invites` DISABLE KEYS */;
INSERT INTO `invites` VALUES ('e05c6934-3656-4c41-8afe-e2ff72bafb52','rxBLtnva5W','210f6e07-8cd5-4fe3-92d3-73d6854d4393','3d11b2b0-feba-4c47-9ad8-80a1c719f323',10,1,'2026-03-19 23:04:46','2026-03-19 15:04:46');
/*!40000 ALTER TABLE `invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` varchar(36) NOT NULL,
  `channel_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `content` varchar(1023) NOT NULL,
  `type` enum('text','file','system') NOT NULL,
  `created_at` varchar(45) NOT NULL,
  `updated_at` varchar(45) NOT NULL,
  `reply_to` varchar(36) NOT NULL,
  PRIMARY KEY (`message_id`,`user_id`,`channel_id`),
  KEY `fk_messages_channels1_idx` (`channel_id`),
  KEY `fk_messages_users1_idx` (`user_id`),
  KEY `fk_messages_messages1_idx` (`reply_to`),
  CONSTRAINT `fk_messages_channels1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`channel_id`),
  CONSTRAINT `fk_messages_messages1` FOREIGN KEY (`reply_to`) REFERENCES `messages` (`channel_id`),
  CONSTRAINT `fk_messages_users1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `server_members`
--

DROP TABLE IF EXISTS `server_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `server_members` (
  `user_id` varchar(36) NOT NULL,
  `server_id` varchar(36) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`server_id`),
  KEY `fk_server_members_users1_idx` (`user_id`),
  KEY `fk_server_members_servers1_idx` (`server_id`),
  CONSTRAINT `fk_server_members_servers1` FOREIGN KEY (`server_id`) REFERENCES `servers` (`server_id`),
  CONSTRAINT `fk_server_members_users1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `server_members`
--

LOCK TABLES `server_members` WRITE;
/*!40000 ALTER TABLE `server_members` DISABLE KEYS */;
INSERT INTO `server_members` VALUES ('2236245a-fbd7-41bd-95a4-deb65935c3c3','210f6e07-8cd5-4fe3-92d3-73d6854d4393',NULL,'2026-03-19 15:04:52'),('3d11b2b0-feba-4c47-9ad8-80a1c719f323','210f6e07-8cd5-4fe3-92d3-73d6854d4393',NULL,'2026-03-19 14:59:49');
/*!40000 ALTER TABLE `server_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servers`
--

DROP TABLE IF EXISTS `servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servers` (
  `server_id` varchar(36) NOT NULL,
  `server_name` varchar(255) DEFAULT NULL,
  `description` varchar(1023) DEFAULT NULL,
  `server_icon` varchar(255) DEFAULT NULL,
  `members_count` int NOT NULL,
  `owner_id` varchar(36) NOT NULL,
  `created_at` varchar(45) NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  PRIMARY KEY (`server_id`),
  UNIQUE KEY `channel_id_UNIQUE` (`server_id`),
  KEY `fk_server_users_idx` (`owner_id`),
  CONSTRAINT `fk_server_users` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servers`
--

LOCK TABLES `servers` WRITE;
/*!40000 ALTER TABLE `servers` DISABLE KEYS */;
INSERT INTO `servers` VALUES ('210f6e07-8cd5-4fe3-92d3-73d6854d4393','weeb','','http://localhost:9000/liscord/icons/3d11b2b0-feba-4c47-9ad8-80a1c719f323-b9aaaffd-00c3-4b6c-a52c-7c87687525cb.png',2,'3d11b2b0-feba-4c47-9ad8-80a1c719f323','2026-03-19T14:59:49.975Z');
/*!40000 ALTER TABLE `servers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `online_status` enum('offline','online','sleep','hidden') DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2236245a-fbd7-41bd-95a4-deb65935c3c3','elon','ltloc05samsunggalaxyj3pro@gmail.com','$2b$10$Qcf0oBdmnSGq84u4GEoXqOvs35anGKzwl17efxzRtGgVTZzNm94aW','http://localhost:9000/liscord/avatars/2236245a-fbd7-41bd-95a4-deb65935c3c3-8228987b-bd68-4786-8bea-b002206ca3a0.jpg','Heil',NULL,1,'2026-03-19 21:59:29','2026-03-19 16:46:00'),('3d11b2b0-feba-4c47-9ad8-80a1c719f323','louis','ltloc05lumia520@gmail.com','$2b$10$.Kf/dSRMyCrHD2CvQucTme86EpSWaDPUDjgAw26iHiUMRbtx/McNy','http://localhost:9000/liscord/avatars/3d11b2b0-feba-4c47-9ad8-80a1c719f323-fec7e33f-90bb-49a7-842d-519814197749.png','I am pepe\nBuy this coin at X.com/pepe',NULL,1,'2026-03-19 21:59:02','2026-03-19 16:45:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'liscord'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 18:45:33
