const { pool } = require('./db');

async function seedProduct() {
  const p = {
    id: 'velcro-pb-30',
    name: 'Nappee Velcro Style Diapers (Premature Baby)',
    packSize: '30 pcs',
    mrp: 399,
    sellingPrice: 349,
    discount: 12,
    description: 'Extra gentle velcro diapers for delicate premature babies.',
    imageFallback: '#FDFCF0',
    stock: 100,
    stockStatus: 'IN_STOCK',
    totalSold: 0,
    active: 1,
    imageUrl: '/public/products/V-PB-30.png',
    category: 'Velcro Style'
  };

  try {
    const q = `
      IF NOT EXISTS (SELECT 1 FROM Product WHERE id = '${p.id}')
        INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active, imageUrl, category)
        VALUES ('${p.id}', '${p.name}', '${p.packSize}', ${p.mrp}, ${p.sellingPrice}, ${p.discount}, '${p.description}', '${p.imageFallback}', ${p.stock}, '${p.stockStatus}', ${p.totalSold}, ${p.active}, '${p.imageUrl}', '${p.category}')
      ELSE
        UPDATE Product SET 
          name = '${p.name}', packSize = '${p.packSize}', mrp = ${p.mrp}, sellingPrice = ${p.sellingPrice}, discount = ${p.discount},
          description = '${p.description}', imageFallback = '${p.imageFallback}', stock = ${p.stock}, stockStatus = '${p.stockStatus}',
          active = ${p.active}, imageUrl = '${p.imageUrl}', category = '${p.category}'
        WHERE id = '${p.id}';
    `;
    const client = await pool;
    await client.query(q);
    console.log('Seeded:', p.name);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding product:', err);
    process.exit(1);
  }
}

seedProduct();
