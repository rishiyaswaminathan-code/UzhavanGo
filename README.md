# UZHAVANGO — Full-Stack Farm Marketplace

A modern, role-based direct farm marketplace built on the 3-Tier Full-Stack Architecture:
```
  ┌────────────────────────────────────────────────────────┐
  │                   React.js Frontend                    │
  │     (Vite + React 18, Modular Components, Agritech UI) │
  └──────────────────────────┬─────────────────────────────┘
                             │ REST API (JSON)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │              Node.js + Express.js Backend              │
  │    (Modular Routers, JWT Auth, PBKDF2 Hashing, Guards) │
  └──────────────────────────┬─────────────────────────────┘
                             │ MySQL Pool / Connection
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                     MySQL Database                     │
  │     (Relational Schema: users, posts, offers, orders)  │
  └────────────────────────────────────────────────────────┘
```

---

## 🌟 Modules & Features

### 1. 👨‍🌾 Farmer Module
- **Produce Listings**: Post fresh harvests with photos, quality grades (Grade A, Organic Certified, Export Quality, etc.), units, and quantities.
- **Pure Discovery Marketplace**: Farmers never set fixed prices; buyers place competitive bids.
- **Private Bid Evaluation**: Compare all incoming buyer offers and accept the best bid to generate an Order.
- **Order Progression**: Track delivery status from `Order Confirmed` to `Pickup`, `In Transit`, `Delivered`, and `Completed`.

### 2. 🧑‍💼 Buyer Module
- **Harvest Discovery**: Search fresh crops by name, location, and quality grade.
- **Confidential Bidding**: Submit price offers per unit with required quantity and delivery message. Bids remain private between buyer and farmer.
- **Online Payments**: Pay online via **UPI**, **Debit/Credit Card**, or **Net Banking** once an offer is accepted.
- **Instant Digital Receipts**: Transaction ID and printable payment receipts.

### 3. 👨‍💻 Admin Portal
- **Role-Protected Login**: Hashed PBKDF2 SHA-512 authentication (`admin@uzhavan.com` / `uzhavan@2026`).
- **Dashboard Stats**: Real-time platform metrics for Farmers, Buyers, Harvests, Bids, Orders, and Payments.
- **Moderation & User Controls**: Activate/deactivate accounts, review harvest listings, resolve dispute reports.
- **System Broadcast**: Send platform announcements to all users or specific roles.
- **Audit Logs**: Chronological activity logs of all administrative actions.

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Database (Optional / MySQL)
Set your MySQL credentials in `backend/.env`:
```env
PORT=5000
JWT_SECRET=uzhavango-super-secret-key-2026-production-ready
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=uzhavango_db
DB_PORT=3306
```
*(If MySQL is not running, the application automatically runs in seamless in-memory development mode).*

### 3. Start Backend & Frontend
In terminal 1 (Backend):
```bash
npm run backend
```

In terminal 2 (Frontend):
```bash
npm run frontend
```

Open **`http://localhost:3000`** in your browser to access the React application.

---

### 🔑 Default Credentials
- **Admin**: `admin@uzhavan.com` / `uzhavan@2026`
- **Farmer Demo**: Phone `9876543210` (Arun Kumar)
- **Buyer Demo**: Phone `9123456780` (Ananya Retail)

