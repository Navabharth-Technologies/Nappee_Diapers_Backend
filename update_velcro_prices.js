require('dotenv').config();
const { pool } = require('./db');

async function updateVelcroPrices() {
  try {
    // 1. Update Premie (PB) - Pack of 30: MRP 699, Selling Price 599
    // Discount: round(((699 - 599) / 699) * 100) = 14%
    await pool.query(`
      UPDATE product SET 
        name = 'Nappee Imported Premium Premie (PB) Baby Diapers – Tape & Velcro – Pack of 30',
        packsize = '30 pcs',
        mrp = 699,
        sellingprice = 599,
        discount = 14,
        category = 'Velcro Style'
      WHERE id = 'velcro-pb-30'
    `);
    console.log('Updated velcro-pb-30');

    // 2. Update Newborn (NB) - Pack of 72 or 36 & 72:
    // In image: "Nappee Imported Premium Newborn (NB) Baby Diapers – Tape & Velcro – Pack of 36 & 72", From Rs. 649, Rs. 899
    // velcro-nb-72: MRP 899, Selling Price 649, discount 28%
    await pool.query(`
      UPDATE product SET 
        name = 'Nappee Imported Premium Newborn (NB) Baby Diapers – Tape & Velcro – Pack of 36 & 72',
        packsize = '36 & 72 pcs',
        mrp = 899,
        sellingprice = 649,
        discount = 28,
        category = 'Velcro Style'
      WHERE id = 'velcro-nb-72'
    `);
    console.log('Updated velcro-nb-72');

    // 3. Update Small (S) - Pack of 62: MRP 1499, Selling Price 1099
    // Discount: round(((1499 - 1099) / 1499) * 100) = 27%
    await pool.query(`
      UPDATE product SET 
        name = 'Nappee Imported Premium Small (S) Baby Diapers – Tape & Velcro – Pack of 62',
        packsize = '62 pcs',
        mrp = 1499,
        sellingprice = 1099,
        discount = 27,
        category = 'Velcro Style'
      WHERE id = 'velcro-s-62'
    `);
    console.log('Updated velcro-s-62');

    // 4. Update Medium (M) - Pack of 52: MRP 1499, Selling Price 1099
    // Discount: round(((1499 - 1099) / 1499) * 100) = 27%
    await pool.query(`
      UPDATE product SET 
        name = 'Nappee Imported Premium Medium (M) Baby Diapers – Tape & Velcro – Pack of 52',
        packsize = '52 pcs',
        mrp = 1499,
        sellingprice = 1099,
        discount = 27,
        category = 'Velcro Style'
      WHERE id = 'velcro-m-52'
    `);
    console.log('Updated velcro-m-52');

    const check = await pool.query("SELECT id, name, packsize, mrp, sellingprice, discount, stockstatus FROM product WHERE category = 'Velcro Style'");
    console.log("Current Velcro Style Products in DB:", check.rows);
  } catch (err) {
    console.error("Error updating velcro prices:", err);
  } finally {
    process.exit(0);
  }
}

updateVelcroPrices();
