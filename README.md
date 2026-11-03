# Nappee Diapers - Backend Application Suite

Welcome to the **Nappee Diapers Backend Application Suite**, a modern cloud operations platform designed to streamline REST API services, transactional database operations, automated Razorpay payment reconciliation, Meta WhatsApp Cloud messaging, and hyperlocal delivery routing for eco-friendly baby and adult diapers.

The suite consists of four interconnected components:

* ⚡ **REST API Gateway & Controllers:**  
  High-performance Express.js endpoints powering product catalogue discovery, dynamic cart calculation, order creation, delivery tracking, and administrative store management.

* 💳 **Payment & Auto-Reconciliation Engine:**  
  Server-side Razorpay order and payment link creation, cryptographic HMAC-SHA256 signature verification, and an autonomous 30-second background poller for seamless payment sync.

* 💬 **Meta WhatsApp Cloud Messaging Engine:**  
  Direct integration with Meta Graph API v17.0 for interactive button replies, product catalog browsing, automated order confirmations, delivery partner dispatches, and live delivery updates.

* 🗄️ **Relational Cloud Data Store (Azure SQL):**  
  Enterprise-grade Microsoft Azure SQL database maintaining relational data integrity across orders, line items, customer addresses, coupons, and real-time inventory counts.

---

## 📂 Project Structure

| Component | Path | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Server & API Gateway** | `./server.js` | Express.js 5.2 / Node.js | Master application entry point, middleware, routes, and auto-reconciliation worker |
| **Route Modules** | `./apiRoutes.js` | Express.js | Modular REST endpoints for products, customers, orders, and coupons |
| **Database Layer** | `./db.js` | Azure SQL / MSSQL (`mssql`) | Connection pooling, SQL Server configuration, and parameterized query execution |
| **Database Migrations** | `./initDb.js`, `./init.sql` | SQL Server / Node.js | Programmatic table initialization, foreign key constraints, and schema creation |
| **WhatsApp Service** | `./services/whatsappService.js` | Meta Graph API v17.0 / Axios | Outbound WhatsApp templates, interactive buttons, and catalog messages |
| **AI Conversational Service** | `./services/aiService.js` | OpenAI / Intent Router | Natural language parsing and intent routing for inbound WhatsApp customer chats |
| **Static & Compliance Assets** | `./public` | Express Static | Live Google Play Privacy Policy, Terms of Service, and product imagery CDN |
| **CI/CD Deployment** | `./.github/workflows` | GitHub Actions / Azure OIDC | Automated deployment pipeline pushing commits directly to Azure App Service |

---

## ✨ Core Features

### ⚡ REST API & Order Lifecycle

#### Catalogue & Inventory Management
* Full CRUD endpoints for Pant-Style and Velcro-Style diaper SKUs (NB to XXXL, 40 to 72 pcs)
* Real-time stock counters (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) with instant status toggles
* Product image hosting and asset serving via `/public/products/`
* Price, MRP, and discount percentage synchronization utilities

#### Atomic Order Fulfilment
* Transactional multi-table order placement (`Order` + `OrderItem` + `Address`)
* Hyperlocal Mysuru PIN-code verification (`570001` to `570026`)
* Order lifecycle progression (`CONFIRMED` ➔ `ASSIGNED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`)
* Real-time tracking event timeline logging (`TrackingEvent`)

#### Customer & Delivery Partner Management
* Phone-based customer lookup and automated profile creation
* Delivery partner directory with real-time active load counters
* One-click delivery partner assignment with automated dispatch triggers

---

### 💳 Razorpay Payment Integration

#### Order Creation & Link Generation
* Dedicated `/api/payments/create-order` endpoint generating official Razorpay order IDs
* Dynamic payment link creation for mobile web and WhatsApp checkout flows

#### Cryptographic Signature Verification
* Server-side HMAC-SHA256 signature verification comparing `razorpay_signature` against server secrets
* Instant order state transition to `PAID` upon successful verification

#### Autonomous 30-Second Reconciliation Worker
* Periodic background worker scanning orders with pending Razorpay references
* Queries live Razorpay APIs (`razorpay.orders.fetch` / `razorpay.paymentLink.fetch`)
* Automatically confirms payments captured at the gateway without requiring user reload

#### Webhook Integration
* Secure webhook listener (`/api/payments/razorpay/webhook`) capturing gateway events
* Tamper-proof raw body signature verification

---

### 💬 Meta WhatsApp Business Cloud Messaging

#### Automated Transactional Triggers
* **Order Confirmation:** Dispatches instant WhatsApp receipt with order number, amount, and items
* **Delivery Partner Assignment:** Alerts customer with delivery partner name and direct phone number
* **Delivery Completion:** Sends thank-you confirmation once partner marks order `DELIVERED`

#### Interactive Chatbot & Inbound Routing
* Interactive quick reply buttons (`🛍️ Shop`, `📦 Track Order`, `📜 My Orders`)
* WhatsApp product catalog integration for seamless mobile browsing
* Intelligent fallback to human agent support upon customer request

#### Location Pin Reverse Geocoding
* Handles inbound GPS location pins sent directly via WhatsApp
* Reverse geocodes coordinates via OpenStreetMap Nominatim API
* Validates whether customer drop-off point falls within Mysuru municipal bounds (`570xxx`)

---

### 🗄️ Relational Cloud Database (Azure SQL)

#### Normalized Enterprise Schema
* **`Product`**: SKU attributes, sizing, pack counts, MRP, selling price, and stock levels
* **`Customer`**: Customer profiles, contact details, and primary postal codes
* **`Address`**: Structured postal addresses, landmarks, and GPS latitude/longitude coordinates
* **`[Order]`**: Transaction records, financial calculations, payment status, and gateway IDs
* **`OrderItem`**: Historical snapshot of purchased items, quantities, and unit prices
* **`DeliveryPartner`**: Registered field personnel directory and active assignment status
* **`Coupon`**: Promotional discount rules, usage counters, and influencer attribution tags
* **`TrackingEvent`**: Chronological order milestones for customer-facing tracking
* **`WhatsAppSession`**: Ephemeral state machine tracking ongoing WhatsApp customer chat flows

#### Security & Concurrency
* Native connection pooling via `mssql` supporting resilient cloud reconnects
* Parameterized SQL queries protecting against SQL injection vulnerabilities
* Point-in-time database recovery (PITR) with automated daily Azure backups

---

## 🎨 Operational Architecture

### High Availability Cloud Infrastructure
* Hosted on **Microsoft Azure App Service** (Linux runtime, Central India Data Center)
* Integrated health check probes (`GET /health` and `GET /`) for uptime monitoring
* Automatic TLS/HTTPS encryption across all REST endpoints and webhooks

### Regulatory & Store Compliance
* Live hosted endpoints serving Google Play Store compliant legal documents:
  - **Privacy Policy:** `https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net/privacy-policy`
  - **Terms & Conditions:** `https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net/terms`

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (LTS Version 20.x or higher)
* **npm** (v10.x or higher)
* **Microsoft Azure SQL Database** or local SQL Server instance
* **Razorpay Merchant Account** (Key ID & Secret)
* **Meta WhatsApp Cloud API Account** (Phone Number ID & Access Token)

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Navabharth-Technologies/Nappee_Diapers_Backend.git

# 2. Navigate to directory
cd Nappee_Diapers_Backend

# 3. Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to create your `.env` configuration file:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Server
PORT=5001

# Microsoft Azure SQL Database
DB_SERVER=your_server.database.windows.net
DB_NAME=Nappee_Diaper
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Admin Credentials
OWNER_USERNAME=owner
OWNER_PASSWORD=your_owner_password

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Meta WhatsApp Cloud API (Graph API v17.0)
WHATSAPP_PHONE_NUMBER_ID=10xxxxxxxxxxxxx
WHATSAPP_ACCESS_TOKEN=EAAGxxxxxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_WABA_ID=your_waba_account_id

# AI & Additional Services
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
CALLBACK_URL=https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net
AZURE_WEBAPP_NAME=Nappee
```

### Database Initialization

Initialize database tables and seed diaper catalogue:

```bash
# Initialize tables and relationships
node initDb.js

# Seed initial diaper products
node seed_diapers.js
```

### Start Server

```bash
npm start
```
* Server will start on `http://127.0.0.1:5001` (or configured `PORT`).

---

## 🛠 Deployment & Cloud Operations

### Automated CI/CD (GitHub Actions)
The backend employs continuous deployment via GitHub Actions (`.github/workflows/main_nappee.yml`):
* Every commit pushed to the `main` branch automatically triggers the build and deploy workflow.
* Securely authenticates with Microsoft Azure using **OpenID Connect (OIDC)** without hardcoded credentials.
* Deploys directly to the Production slot of Azure Web App `Nappee`.

### Cloud Endpoints
* **Production API Base URL:**  
  `https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net`
* **Health Check Probe:**  
  `https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net/health`
* **WhatsApp Webhook:**  
  `https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net/api/webhook`

---

## 🤝 Contribution & Maintenance

This project is developed and maintained by the **Navabharath Technologies Development Team** for **Nappee Diapers (Parisara Samrakshana Foundation)**.

* **Organization:** Navabharath Technologies
* **Official Website:** [https://www.nappeediapers.in/](https://www.nappeediapers.in/)
* **Production Backend:** [Azure App Service](https://nappee-cmfab8eyb3d9f0cf.centralindia-01.azurewebsites.net)

For support, enhancements, or technical queries, please contact the repository administrator.

---

© 2026 Navabharath Technologies. All Rights Reserved.
