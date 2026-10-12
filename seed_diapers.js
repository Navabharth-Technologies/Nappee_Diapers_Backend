const { pool } = require('./db');

async function seedProducts() {
  const products = [
    {
      id: 'velcro-nb-72',
      name: 'Nappee Velcro Style Diapers (Newborn)',
      packSize: '72 pcs',
      mrp: 599,
      sellingPrice: 499,
      discount: 16,
      description: 'Gentle, tape-style diapers designed especially for delicate newborns.',
      imageFallback: '#FDFCF0',
      stock: 100,
      stockStatus: 'IN_STOCK',
      totalSold: 0,
      active: 1,
      imageUrl: '/public/products/V-NB-72.jpg',
      category: 'Velcro Style'
    },
    {
      id: 'velcro-s-62',
      name: 'Nappee Velcro Style Diapers (Small)',
      packSize: '62 pcs',
      mrp: 699,
      sellingPrice: 599,
      discount: 14,
      description: 'Adjustable velcro diapers for growing small babies.',
      imageFallback: '#E1F5FE',
      stock: 100,
      stockStatus: 'IN_STOCK',
      totalSold: 0,
      active: 1,
      imageUrl: '/public/products/V-S-62.jpg',
      category: 'Velcro Style'
    },
    {
      id: 'velcro-m-52',
      name: 'Nappee Velcro Style Diapers (Medium)',
      packSize: '52 pcs',
      mrp: 699,
      sellingPrice: 599,
      discount: 14,
      description: 'Secure fit velcro diapers for active medium sized babies.',
      imageFallback: '#5AB9EA',
      stock: 100,
      stockStatus: 'IN_STOCK',
      totalSold: 0,
      active: 1,
      imageUrl: '/public/products/V-M-52.jpg',
      category: 'Velcro Style'
    }
  ];

  try {
    for (const p of products) {
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
    }
    console.log('All velcro products seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();
