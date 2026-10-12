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
      const { id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, active, imageUrl, category } = req.body;
      await pool.query(
        `INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active, imageUrl, category) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, $12, $13)`,
        [id, name, packSize || '1', mrp || 0, sellingPrice || 0, discount || 0, description || '', imageFallback || '', stock || 0, stockStatus || 'IN_STOCK', active === false ? 0 : 1, imageUrl || '', category || 'Pant-Style']
      );
      res.status(201).json({ success: true });
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
