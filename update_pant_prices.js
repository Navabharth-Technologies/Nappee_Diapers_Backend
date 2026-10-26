require('dotenv').config();
const { pool } = require('./db');

async function updatePrices() {
  const updates = [
    { id: 'pant-s-62', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100), stockstatus: 'OUT_OF_STOCK', stock: 0 },
    { id: 'pant-m-56', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100) },
    { id: 'pant-l-52', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100) },
    { id: 'pant-xl-48', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100) },
    { id: 'pant-xxl-44', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100) },
    { id: 'pant-xxxl-40', mrp: 1599, sellingprice: 1199, discount: Math.round(((1599 - 1199) / 1599) * 100) }
  ];

  try {
    for (const item of updates) {
      if (item.stockstatus) {
        await pool.query(
          `UPDATE product SET mrp = ${item.mrp}, sellingprice = ${item.sellingprice}, discount = ${item.discount}, stockstatus = '${item.stockstatus}', stock = ${item.stock} WHERE id = '${item.id}'`
        );
      } else {
        await pool.query(
          `UPDATE product SET mrp = ${item.mrp}, sellingprice = ${item.sellingprice}, discount = ${item.discount} WHERE id = '${item.id}'`
        );
      }
      console.log(`Updated ${item.id}: MRP = ₹${item.mrp}, Selling Price = ₹${item.sellingprice}`);
    }

    const check = await pool.query("SELECT id, name, packsize, mrp, sellingprice, stockstatus FROM product WHERE category = 'Pant-Style'");
    console.log("Current Pant-Style Products:", check.rows);
  } catch (err) {
    console.error("Error updating prices:", err);
  } finally {
    process.exit(0);
  }
}

updatePrices();
