const { pool } = require('./db');

async function fixImages() {
  try {
    await pool.query(`UPDATE Product SET imageUrl = '/public/images/(P)XXXL-40.webp' WHERE packSize = '40 pcs'`);
    await pool.query(`UPDATE Product SET imageUrl = '/public/images/(P)XXL-44.webp' WHERE packSize = '44 pcs'`);
    console.log("Fixed XXL and XXXL images!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixImages();
