const fs = require('fs');
const path = require('path');

function saveBase64Image(id, imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  try {
    const matches = imageUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      let ext = matches[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      const buffer = Buffer.from(matches[2], 'base64');
      const cleanId = (id || `prod_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${cleanId}.${ext}`;
      const targetDir = path.join(__dirname, 'public', 'products');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filePath = path.join(targetDir, fileName);
      fs.writeFileSync(filePath, buffer);
      return `/public/products/${fileName}`;
    }
  } catch (err) {
    console.error('Failed to write base64 image to file:', err);
  }
  return imageUrl;
}

module.exports = function(app, pool) {
  // PRODUCTS
  app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Product');
      // Format the result properly for frontend
      const products = result.rows.map(p => ({
        ...p,
        active: p.active === 1 || p.active === true,
        stockStatus: p.stockstatus,
        imageFallback: p.imagefallback,
        sellingPrice: parseFloat(p.sellingprice) || 0,
        mrp: parseFloat(p.mrp) || 0,
        imageUrl: p.imageurl,
        packSize: p.packsize,
        totalSold: parseInt(p.totalsold) || 0
      }));
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      let { id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, active, imageUrl, category } = req.body;
      imageUrl = saveBase64Image(id, imageUrl);
      await pool.query(
        `INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active, imageUrl, category) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, $12, $13)`,
        [id, name, packSize || '1', mrp || 0, sellingPrice || 0, discount || 0, description || '', imageFallback || '', stock || 0, stockStatus || 'IN_STOCK', active === false ? 0 : 1, imageUrl || '', category || 'Pant-Style']
      );
      res.status(201).json({ success: true, imageUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id/image', async (req, res) => {
    try {
      const { id } = req.params;
      let { imageUrl } = req.body;
      imageUrl = saveBase64Image(id, imageUrl);
      await pool.query('UPDATE Product SET imageUrl = $1 WHERE id = $2', [imageUrl, id]);
      res.json({ success: true, imageUrl });
    } catch (err) {
      console.error("Error updating image:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, packSize, mrp, sellingPrice, discount, description, stock, stockStatus, active, imageUrl, category } = req.body;
      const updates = [];
      const values = [];
      let idx = 1;
      if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
      if (packSize !== undefined) { updates.push(`packSize = $${idx++}`); values.push(packSize); }
      if (mrp !== undefined) { updates.push(`mrp = $${idx++}`); values.push(mrp); }
      if (sellingPrice !== undefined) { updates.push(`sellingPrice = $${idx++}`); values.push(sellingPrice); }
      if (discount !== undefined) { updates.push(`discount = $${idx++}`); values.push(discount); }
      if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
      if (stock !== undefined) { updates.push(`stock = $${idx++}`); values.push(stock); }
      if (stockStatus !== undefined) { updates.push(`stockStatus = $${idx++}`); values.push(stockStatus); }
      if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active ? 1 : 0); }
      if (imageUrl !== undefined) { updates.push(`imageUrl = $${idx++}`); values.push(imageUrl); }
      if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE Product SET ${updates.join(', ')} WHERE id = $${idx}`, values);
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id/stock', async (req, res) => {
    try {
      const { stock, stockStatus } = req.body;
      await pool.query('UPDATE Product SET stock = $1, stockStatus = $2 WHERE id = $3', [stock, stockStatus, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id/active', async (req, res) => {
    try {
      const { active } = req.body;
      await pool.query('UPDATE Product SET active = $1 WHERE id = $2', [active ? 1 : 0, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CUSTOMERS
  app.get('/api/customers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Customer');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ORDERS
  app.get('/api/orders', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM [Order]');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // COUPONS
  app.get('/api/coupons', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Coupon');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/coupons', async (req, res) => {
    try {
      const { id, code, type, discountType, discountValue, minimumOrderValue, maximumDiscount, usageLimit } = req.body;
      await pool.query(
        `INSERT INTO Coupon (id, code, type, discountType, discountValue, minimumOrderValue, maximumDiscount, usageLimit, active, usedCount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, 0)`,
        [id, code, type, discountType, discountValue, minimumOrderValue, maximumDiscount, usageLimit]
      );
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};
