-- UzhavanGo Database Schema for MySQL
CREATE DATABASE IF NOT EXISTS uzhavango_db;
USE uzhavango_db;

-- 1. Users Table (Farmers & Buyers)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  role ENUM('farmer', 'buyer') NOT NULL,
  location VARCHAR(255) NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Produce Posts Table (Farmers) - With Partial Quantity Purchase & Inventory Tracking
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sold_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image LONGTEXT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Offers/Bids Table (Buyers)
CREATE TABLE IF NOT EXISTS offers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  buyer_id BIGINT NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  offered_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  message TEXT NULL,
  status ENUM('Pending', 'Accepted', 'Closed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  offer_id BIGINT NULL,
  post_id BIGINT NULL,
  product VARCHAR(255) NOT NULL,
  image LONGTEXT NULL,
  farmer VARCHAR(255) NOT NULL,
  buyer VARCHAR(255) NOT NULL,
  quantity VARCHAR(100) NOT NULL,
  bid_price DECIMAL(12,2) NOT NULL,
  delivery_charge DECIMAL(10,2) DEFAULT 100.00,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PAYMENT PENDING',
  payment_status VARCHAR(50) DEFAULT 'Pending',
  txn_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  txn_id VARCHAR(100) NOT NULL UNIQUE,
  order_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('UPI', 'Card', 'NetBanking') NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Successful',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  reporter_id BIGINT NULL,
  reporter_name VARCHAR(255) NULL,
  reported_user_id BIGINT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('pending', 'investigating', 'resolved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NULL,
  target_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  target_role VARCHAR(50) DEFAULT 'all',
  sent_by VARCHAR(255) DEFAULT 'Administrator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
