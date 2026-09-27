-- UzhavanGo Seed Data for MySQL
USE uzhavango_db;

-- Default Administrator (admin@uzhavan.com / uzhavan@2026)
-- Hash: pbkdf2 with salt 'a8f5b3c2e1d0498765f4e3d2c1b0a987', 10000 iterations, sha512
INSERT INTO admins (id, email, salt, password_hash, name)
VALUES (1, 'admin@uzhavan.com', 'a8f5b3c2e1d0498765f4e3d2c1b0a987', '6b798ee31d91afeac80fb204c3d66aac3b410be64634a531d5ce97c48a604178769c12ad1f9aaa479f653ffe72433effe73c55174bf4b7dbc7a069cb93dbcfca', 'UzhavanGo Administrator')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Users (Farmers & Buyers)
INSERT INTO users (id, name, phone, email, role, location, active) VALUES
(101, 'Arun Kumar', '9876543210', 'arun@farm.in', 'farmer', 'Madurai, Tamil Nadu', true),
(102, 'Murugan Vel', '9845123456', 'murugan@agri.in', 'farmer', 'Theni, Tamil Nadu', true),
(103, 'Kavitha Raj', '9789012345', 'kavitha@green.in', 'farmer', 'Dindigul, Tamil Nadu', true),
(201, 'Ananya Retail', '9123456780', 'contact@ananyaretail.com', 'buyer', 'Chennai, Tamil Nadu', true),
(202, 'FreshMart Wholesale', '9234567891', 'orders@freshmart.in', 'buyer', 'Coimbatore, Tamil Nadu', true)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Produce Posts (No Grading, Automatic Representative Images)
INSERT INTO posts (id, farmer_id, farmer_name, product_name, quantity, unit, location, description, image, status) VALUES
(1, 101, 'Arun Kumar', 'Organic Country Tomatoes', 500.00, 'kg', 'Madurai, Tamil Nadu', 'Naturally ripened desi farm tomatoes, fresh harvest from organic soil.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', 'Posted'),
(2, 102, 'Murugan Vel', 'Fresh Red Onions (Bellary)', 1200.00, 'kg', 'Theni, Tamil Nadu', 'High pungent onions cured for long shelf life.', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', 'Posted'),
(3, 103, 'Kavitha Raj', 'Farm Fresh Spinach (Palak)', 250.00, 'bunches', 'Dindigul, Tamil Nadu', 'Crisp green organic palak, harvested early morning.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', 'Posted')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);
