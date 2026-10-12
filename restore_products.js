const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgres://nappee_db_user:A5po9SYOqeMqDHUWHO3LkkvFZPWGwxDP@dpg-da5uv1ojo6nc73dq9j6g-a.oregon-postgres.render.com:5432/nappee_db', 
  ssl: { rejectUnauthorized: false } 
});

async function restoreProducts() {
  const client = await pool.connect();
  try {
    console.log("Restoring products...");
    await client.query(`
      INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active)
      VALUES 
      ('p1', 'nappee Cotton diapers – 30 diapers', '30 diapers', 414.00, 359.00, 13.00, 'Our most popular pack. Super soft, breathable cotton diapers with wings. Ideal for regular to heavy flow.', '#A390E4', 50, 'IN_STOCK', 120, true),
      ('p2', 'nappee Cotton diapers – 20 diapers', '20 diapers', 278.00, 249.00, 10.00, 'Perfect for your monthly cycle. Comfortable and rash-free experience.', '#A390E4', 35, 'IN_STOCK', 85, true),
      ('p3', 'nappee Cotton diapers – 10 diapers Pack', '10 diapers', 155.00, 139.00, 10.00, 'Travel-friendly pack. Experience the comfort of pure cotton.', '#A390E4', 0, 'OUT_OF_STOCK', 30, true),
      ('p4', 'nappee Cotton diapers – 6 diapers Pack', '6 diapers', 85.00, 77.00, 9.00, 'A trial pack to experience true comfort and care.', '#A390E4', 7, 'LOW_STOCK', 15, true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Products successfully restored!");
  } catch (err) {
    console.error("Error restoring products:", err);
  } finally {
    client.release();
    pool.end();
  }
}

restoreProducts();
