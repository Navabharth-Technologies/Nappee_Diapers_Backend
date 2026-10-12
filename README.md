# Nappee Diapers - Backend

Node.js & Express REST API server for Nappee Diapers application with Microsoft SQL Server (MSSQL), Razorpay, WhatsApp integration, and AI support.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your database and service credentials:
```env
PORT=5001
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=Nappee_Diaper
OWNER_USERNAME=owner
OWNER_PASSWORD=your_owner_password
```

### 3. Initialize Database
```bash
node initDb.js
node seed_diapers.js
```

### 4. Run the Server
```bash
npm start
```
Server runs on `http://127.0.0.1:5001`.
