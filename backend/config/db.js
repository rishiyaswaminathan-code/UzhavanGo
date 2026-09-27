const mysql = require('mysql2/promise');
const crypto = require('crypto');
const { getProduceImage } = require('../utils/produceImages');
require('dotenv').config();

let pool = null;
let isConnectedToMySQL = false;

// Fallback in-memory data store in case MySQL is offline
const memoryStore = {
  admins: [{
    id: 1,
    email: 'admin@uzhavan.com',
    salt: 'a8f5b3c2e1d0498765f4e3d2c1b0a987',
    password_hash: '6b798ee31d91afeac80fb204c3d66aac3b410be64634a531d5ce97c48a604178769c12ad1f9aaa479f653ffe72433effe73c55174bf4b7dbc7a069cb93dbcfca',
    name: 'UzhavanGo Administrator'
  }],
  users: [
    { id: 101, name: 'Arun Kumar', phone: '9876543210', email: 'arun@farm.in', role: 'farmer', location: 'Madurai, Tamil Nadu', active: 1, created_at: new Date() },
    { id: 102, name: 'Murugan Vel', phone: '9845123456', email: 'murugan@agri.in', role: 'farmer', location: 'Theni, Tamil Nadu', active: 1, created_at: new Date() },
    { id: 103, name: 'Kavitha Raj', phone: '9789012345', email: 'kavitha@green.in', role: 'farmer', location: 'Dindigul, Tamil Nadu', active: 1, created_at: new Date() },
    { id: 201, name: 'Ananya Retail', phone: '9123456780', email: 'contact@ananyaretail.com', role: 'buyer', location: 'Chennai, Tamil Nadu', active: 1, created_at: new Date() },
    { id: 202, name: 'FreshMart Wholesale', phone: '9234567891', email: 'orders@freshmart.in', role: 'buyer', location: 'Coimbatore, Tamil Nadu', active: 1, created_at: new Date() }
  ],
  posts: [
    {
      id: 1,
      farmer_id: 101,
      farmer_name: 'Arun Kumar',
      product_name: 'Organic Country Tomatoes',
      quantity: 500,
      total_quantity: 500,
      available_quantity: 500,
      sold_quantity: 0,
      totalQuantity: 500,
      availableQuantity: 500,
      soldQuantity: 0,
      unit: 'kg',
      location: 'Madurai, Tamil Nadu',
      description: 'Naturally ripened desi farm tomatoes, fresh harvest from organic soil.',
      image: getProduceImage('Organic Country Tomatoes'),
      status: 'Active',
      created_at: new Date()
    },
    {
      id: 2,
      farmer_id: 102,
      farmer_name: 'Murugan Vel',
      product_name: 'Fresh Red Onions (Bellary)',
      quantity: 1200,
      total_quantity: 1200,
      available_quantity: 1200,
      sold_quantity: 0,
      totalQuantity: 1200,
      availableQuantity: 1200,
      soldQuantity: 0,
      unit: 'kg',
      location: 'Theni, Tamil Nadu',
      description: 'High pungent onions cured for long shelf life.',
      image: getProduceImage('Fresh Red Onions'),
      status: 'Active',
      created_at: new Date()
    },
    {
      id: 3,
      farmer_id: 103,
      farmer_name: 'Kavitha Raj',
      product_name: 'Farm Fresh Spinach (Palak)',
      quantity: 250,
      total_quantity: 250,
      available_quantity: 250,
      sold_quantity: 0,
      totalQuantity: 250,
      availableQuantity: 250,
      soldQuantity: 0,
      unit: 'bunches',
      location: 'Dindigul, Tamil Nadu',
      description: 'Crisp green organic palak, harvested early morning.',
      image: getProduceImage('Farm Fresh Spinach'),
      status: 'Active',
      created_at: new Date()
    },
    {
      id: 4,
      farmer_id: 101,
      farmer_name: 'Arun Kumar',
      product_name: 'Kashmiri Sweet Apples',
      quantity: 350,
      total_quantity: 350,
      available_quantity: 350,
      sold_quantity: 0,
      totalQuantity: 350,
      availableQuantity: 350,
      soldQuantity: 0,
      unit: 'kg',
      location: 'Madurai, Tamil Nadu',
      description: 'Crisp, sweet, organic mountain apples direct from orchard harvest.',
      image: getProduceImage('Kashmiri Sweet Apples'),
      status: 'Active',
      created_at: new Date()
    },
    {
      id: 5,
      farmer_id: 102,
      farmer_name: 'Murugan Vel',
      product_name: 'Fresh Garden Cucumbers',
      quantity: 400,
      total_quantity: 400,
      available_quantity: 400,
      sold_quantity: 0,
      totalQuantity: 400,
      availableQuantity: 400,
      soldQuantity: 0,
      unit: 'kg',
      location: 'Theni, Tamil Nadu',
      description: 'Crisp green organic cucumbers, hydrated and firm.',
      image: getProduceImage('Fresh Garden Cucumbers'),
      status: 'Active',
      created_at: new Date()
    },
    {
      id: 6,
      farmer_id: 103,
      farmer_name: 'Kavitha Raj',
      product_name: 'Fresh Farm Pomegranate',
      quantity: 300,
      total_quantity: 300,
      available_quantity: 300,
      sold_quantity: 0,
      totalQuantity: 300,
      availableQuantity: 300,
      soldQuantity: 0,
      unit: 'kg',
      location: 'Dindigul, Tamil Nadu',
      description: 'Juicy ruby-red organic pomegranates harvested fresh from farm orchard.',
      image: getProduceImage('Fresh Farm Pomegranate'),
      status: 'Active',
      created_at: new Date()
    }
  ],
  offers: [],
  orders: [],
  payments: [],
  reports: [],
  activity_logs: [],
  notifications: []
};

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'uzhavango_db';
  const port = process.env.DB_PORT || 3306;

  try {
    const tempConn = await mysql.createConnection({ host, user, password, port });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await tempConn.end();

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true
    });

    await createTables(pool);
    isConnectedToMySQL = true;
    console.log(`✅ [MySQL] Successfully connected to database: ${database} at ${host}:${port}`);
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn(`⚠️ [MySQL] Could not connect to MySQL server (${err.message}).`);
    console.log(`ℹ️ [Database] Running in-memory database mode for seamless development.`);
  }
}

async function createTables(p) {
  await p.query(`
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
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
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
  `);

  // Auto-migrate columns if posts table already existed in MySQL
  try {
    const [cols] = await p.query(`SHOW COLUMNS FROM posts LIKE 'available_quantity'`);
    if (cols.length === 0) {
      await p.query(`ALTER TABLE posts ADD COLUMN total_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
      await p.query(`ALTER TABLE posts ADD COLUMN available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
      await p.query(`ALTER TABLE posts ADD COLUMN sold_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
      await p.query(`UPDATE posts SET total_quantity = quantity WHERE total_quantity = 0.00`);
      await p.query(`UPDATE posts SET available_quantity = quantity WHERE available_quantity = 0.00 AND sold_quantity = 0.00`);
    }
  } catch (migErr) {
    // Ignore migration check error if column already present or not permitted
  }

  await p.query(`
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
  `);

  await p.query(`
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
  `);

  await p.query(`
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
  `);

  await p.query(`
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
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      admin_id BIGINT NOT NULL,
      action VARCHAR(255) NOT NULL,
      target_type VARCHAR(100) NULL,
      target_id VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      target_role VARCHAR(50) DEFAULT 'all',
      sent_by VARCHAR(255) DEFAULT 'Administrator',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed default admin if not exists
  const [adminRows] = await p.query(`SELECT * FROM admins WHERE email = 'admin@uzhavan.com'`);
  if (adminRows.length === 0) {
    await p.query(`
      INSERT INTO admins (email, salt, password_hash, name)
      VALUES ('admin@uzhavan.com', 'a8f5b3c2e1d0498765f4e3d2c1b0a987', '6b798ee31d91afeac80fb204c3d66aac3b410be64634a531d5ce97c48a604178769c12ad1f9aaa479f653ffe72433effe73c55174bf4b7dbc7a069cb93dbcfca', 'UzhavanGo Administrator')
    `);
  }
}

async function query(sql, params = []) {
  if (isConnectedToMySQL && pool) {
    const [results] = await pool.execute(sql, params);
    return results;
  }
  return null;
}

module.exports = {
  initDB,
  getPool: () => pool,
  isMySQL: () => isConnectedToMySQL,
  query,
  memoryStore
};
