CREATE TABLE IF NOT EXISTS signatures (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(40) NOT NULL,
 kind ENUM('text','drawing') NOT NULL,
 color VARCHAR(7) NOT NULL,
 font ENUM('marker','block','script') NOT NULL,
 strokes JSON NULL,
 created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
 INDEX signatures_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
