-- Only mounted into the dedicated portfolio container on first initialization.
CREATE DATABASE IF NOT EXISTS portfolio_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON portfolio_test.* TO 'portfolio'@'%';
