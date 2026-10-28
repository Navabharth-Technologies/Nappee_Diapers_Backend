require('dotenv').config();
let sql;
let config;

if (process.platform === 'win32' && (!process.env.DB_SERVER || !process.env.DB_SERVER.includes('.database.windows.net'))) {
  // Local Windows SQL Server using native ODBC driver (msnodesqlv8)
  sql = require('mssql/msnodesqlv8');
  config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER ? process.env.DB_SERVER.split(',')[0] : 'localhost'},1433;Database=${process.env.DB_NAME};Trusted_Connection=yes;TrustServerCertificate=yes;`
  };
} else {
  // Azure App Service / Linux or Azure SQL - uses pure JavaScript (tedious) driver without requiring native libodbc.so
  sql = require('mssql');
  config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER ? process.env.DB_SERVER.split(',')[0] : 'localhost',
    port: process.env.DB_SERVER && process.env.DB_SERVER.includes(',') ? parseInt(process.env.DB_SERVER.split(',')[1]) : (parseInt(process.env.DB_PORT) || 1433),
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    }
  };
}

const poolPromise = new sql.ConnectionPool(config).connect().then(pool => {
  console.log('Connected to MSSQL');
  return pool;
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(-1);
});

// A wrapper to simulate the pg pool behavior for the existing queries
const pool = {
  query: async (text, params = []) => {
    const p = await poolPromise;
    const request = p.request();
    let mssqlText = text;
    
    // Replace $1, $2 with @uniqueName
    const prefix = `p_${Math.floor(Math.random() * 1000000)}`;
    for (let i = 0; i < params.length; i++) {
        const paramName = `${prefix}_${i+1}`;
        request.input(paramName, params[i]);
        mssqlText = mssqlText.replace(new RegExp(`\\$${i+1}\\b`, 'g'), `@${paramName}`);
    }
    
    // Some basic dynamic translations
    mssqlText = mssqlText.replace(/NOW\(\)/gi, 'GETDATE()');
    mssqlText = mssqlText.replace(/RETURNING id/gi, 'OUTPUT INSERTED.id');
    
    // Handle LIMIT 1
    if (mssqlText.includes('LIMIT 1')) {
        mssqlText = mssqlText.replace(/SELECT \*/gi, 'SELECT TOP 1 *');
        mssqlText = mssqlText.replace(/LIMIT 1/gi, '');
    }
    
    // Handle LIMIT 5
    if (mssqlText.includes('LIMIT 5')) {
        mssqlText = mssqlText.replace(/SELECT \*/gi, 'SELECT TOP 5 *');
        mssqlText = mssqlText.replace(/LIMIT 5/gi, '');
    }
    
    // Handle LIMIT 3
    if (mssqlText.includes('LIMIT 3')) {
        mssqlText = mssqlText.replace(/SELECT \*/gi, 'SELECT TOP 3 *');
        mssqlText = mssqlText.replace(/LIMIT 3/gi, '');
    }

    // Lowercase some keys to match what pg would return
    try {
        const result = await request.query(mssqlText);
        let rows = result.recordset || [];
        // pg returns lowercase column names, mssql retains case. We lowercase them for compatibility.
        rows = rows.map(row => {
            let lowerRow = {};
            for (let key in row) {
                lowerRow[key.toLowerCase()] = row[key];
            }
            return lowerRow;
        });
        return { rows: rows };
    } catch(err) {
        console.error("Query Error:", err.message, "SQL:", mssqlText);
        throw err;
    }
  },
  connect: async () => {
    return {
      query: pool.query,
      release: () => {}
    };
  }
};

async function syncDatabase() {
  try {
    console.log('Auto-syncing database tables...');
    const p = await poolPromise;
    const request = p.request();
    
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Product' and xtype='U')
      CREATE TABLE Product (
          id VARCHAR(50) PRIMARY KEY, 
          name VARCHAR(255) NOT NULL, 
          packSize VARCHAR(50), 
          mrp DECIMAL(10, 2),
          sellingPrice DECIMAL(10, 2), 
          discount DECIMAL(5, 2), 
          description TEXT, 
          imageFallback VARCHAR(50),
          stock INT, 
          stockStatus VARCHAR(50), 
          totalSold INT, 
          active BIT,
          imageUrl TEXT,
          category VARCHAR(100)
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DeliveryPartner' and xtype='U')
      CREATE TABLE DeliveryPartner (
          id VARCHAR(50) PRIMARY KEY, 
          name VARCHAR(255) NOT NULL, 
          phone VARCHAR(20) NOT NULL,
          isActive BIT DEFAULT 1, 
          availabilityStatus VARCHAR(50) DEFAULT 'AVAILABLE',
          createdAt DATETIME DEFAULT GETDATE(), 
          updatedAt DATETIME DEFAULT GETDATE()
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customer' and xtype='U')
      CREATE TABLE Customer (
          id VARCHAR(50) PRIMARY KEY, 
          name VARCHAR(255) NOT NULL, 
          phone VARCHAR(20) NOT NULL, 
          pincode VARCHAR(10)
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WhatsAppMessage' and xtype='U')
      CREATE TABLE WhatsAppMessage (
          id VARCHAR(100) PRIMARY KEY,
          phone VARCHAR(20) NOT NULL,
          sender VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          createdAt DATETIME DEFAULT GETDATE()
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Address' and xtype='U')
      CREATE TABLE Address (
          id VARCHAR(50) PRIMARY KEY, 
          customerId VARCHAR(50) REFERENCES Customer(id),
          name VARCHAR(255) NOT NULL, 
          phone VARCHAR(20) NOT NULL, 
          houseNumber VARCHAR(50), 
          buildingName VARCHAR(255),
          street VARCHAR(255), 
          area VARCHAR(255), 
          landmark VARCHAR(255), 
          city VARCHAR(100), 
          state VARCHAR(100),
          pincode VARCHAR(10), 
          addressType VARCHAR(50), 
          latitude FLOAT, 
          longitude FLOAT
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Coupon' and xtype='U')
      CREATE TABLE Coupon (
          id VARCHAR(50) PRIMARY KEY, 
          code VARCHAR(50) NOT NULL, 
          type VARCHAR(50), 
          discountType VARCHAR(50),
          discountValue DECIMAL(10, 2), 
          minimumOrderValue DECIMAL(10, 2), 
          maximumDiscount DECIMAL(10, 2),
          usageLimit INT, 
          usedCount INT DEFAULT 0, 
          active BIT DEFAULT 1, 
          influencerId VARCHAR(50), 
          influencerName VARCHAR(255)
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Order' and xtype='U')
      CREATE TABLE [Order] (
          id VARCHAR(100) PRIMARY KEY, 
          customerId VARCHAR(50) REFERENCES Customer(id),
          addressId VARCHAR(50) REFERENCES Address(id),
          deliveryPartnerId VARCHAR(50) REFERENCES DeliveryPartner(id),
          couponId VARCHAR(50) REFERENCES Coupon(id),
          subtotal DECIMAL(10, 2), 
          delivery DECIMAL(10, 2), 
          total DECIMAL(10, 2),
          paymentStatus VARCHAR(50), 
          status VARCHAR(50), 
          date DATETIME,
          paymentMethod VARCHAR(50),
          razorpayOrderId VARCHAR(100),
          razorpayPaymentId VARCHAR(100),
          razorpaySignature VARCHAR(255),
          paymentVerifiedAt DATETIME
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItem' and xtype='U')
      CREATE TABLE OrderItem (
          id VARCHAR(50) PRIMARY KEY, 
          orderId VARCHAR(100) REFERENCES [Order](id),
          productId VARCHAR(50) REFERENCES Product(id),
          productName VARCHAR(255), 
          packSize VARCHAR(50), 
          quantity INT, 
          unitPrice DECIMAL(10, 2),
          totalPrice DECIMAL(10, 2), 
          itemStatus VARCHAR(50)
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WhatsAppSession' and xtype='U')
      CREATE TABLE WhatsAppSession (
          phone VARCHAR(20) PRIMARY KEY,
          state VARCHAR(50) NOT NULL,
          pendingOrderId VARCHAR(100),
          updatedAt DATETIME DEFAULT GETDATE()
      );

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TrackingEvent' and xtype='U')
      CREATE TABLE TrackingEvent (
          id VARCHAR(50) PRIMARY KEY, 
          orderId VARCHAR(100) REFERENCES [Order](id),
          status VARCHAR(50), 
          timestamp DATETIME, 
          message VARCHAR(255)
      );
      -- Removed DeliveryPartner auto-seeding to prevent dummy data from returning
      -- Auto-seed Coupons if empty
      IF NOT EXISTS (SELECT 1 FROM Coupon)
      BEGIN
          INSERT INTO Coupon (id, code, type, discountType, discountValue, minimumOrderValue, active)
          VALUES ('c_1', 'WELCOME10', 'GENERAL', 'PERCENTAGE', 10, 500, 1),
                 ('c_2', 'FLAT50', 'GENERAL', 'FLAT', 50, 800, 1);
      END
    `);

    console.log('Database tables verified/created and mock data seeded successfully!');
  } catch (err) {
    console.error('Database auto-sync failed:', err);
  }
}

module.exports = {
  pool, syncDatabase, sql
};
