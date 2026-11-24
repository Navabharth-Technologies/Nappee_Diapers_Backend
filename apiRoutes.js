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
      const products = result.rows.map(p => {
        let images = [];
        if (p.images) {
          try {
            images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          } catch {
            images = String(p.images).split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        
        // Multi-image galleries for all Diapers: Pant-Style, Velcro-Style, and Sample Diapers
        if (!images || images.length <= 1) {
          const idLower = (p.id || '').toLowerCase();
          const nameLower = (p.name || '').toLowerCase();
          const isPant = p.category === 'Pant-Style' || nameLower.includes('pant') || idLower.startsWith('pant');
          const isVelcro = p.category === 'Velcro Style' || (p.category || '').toLowerCase().includes('velcro') || idLower.includes('velcro') || nameLower.includes('velcro') || nameLower.includes('tape');
          const isSample = idLower.includes('prod_1795500818135') || idLower.includes('prod_1795500916500') || nameLower.includes('sample') || nameLower.includes('trial') || nameLower.includes('pack of 2');
          const primaryImg = p.imageurl;

          if (isSample) {
            const samplePrimary = primaryImg || (isVelcro || idLower.includes('velcro') ? '/public/products/prod_1795500916500.jpg' : '/public/products/prod_1795500818135.jpg');
            images = [samplePrimary, '/public/images/(Sample)-back.jpg'];
          } else if (isPant) {
            if (idLower.includes('xxxl') || nameLower.includes('xxxl') || nameLower.includes('triple')) {
              images = [primaryImg || '/public/images/(P)XXXL-40.jpg', '/public/images/(P)XXXL-40-1.jpg', '/public/images/(P)XXXL-40-2.jpg', '/public/images/(P)XXXL-40-3.jpg'];
            } else if (idLower.includes('xxl') || nameLower.includes('xxl') || nameLower.includes('double extra')) {
              images = [primaryImg || '/public/images/(P)XXL-44.jpg', '/public/images/(P)XXL-44-1.jpg', '/public/images/(P)XXL-44-2.jpg', '/public/images/(P)XXL-44-3.jpg'];
            } else if (idLower.includes('xl') || nameLower.includes('(xl)') || nameLower.includes('extra large')) {
              images = [primaryImg || '/public/images/(P)XL-48.jpg', '/public/images/(P)XL-48-1.jpg', '/public/images/(P)XL-48-2.jpg', '/public/images/(P)XL-48-3.jpg'];
            } else if (idLower.includes('-l-') || idLower === 'pant-l' || idLower.includes('l-52') || nameLower.includes('(l)') || nameLower.includes('(large)') || nameLower.includes('large')) {
              images = [primaryImg || '/public/images/(P)L-52.jpg', '/public/images/(P)L-52-1.jpg', '/public/images/(P)L-52-2.jpg', '/public/images/(P)L-52-3.jpg'];
            } else if (idLower.includes('-m-') || idLower === 'pant-m' || idLower.includes('m-56') || nameLower.includes('(m)') || nameLower.includes('(medium)') || nameLower.includes('medium')) {
              images = [primaryImg || '/public/images/(P)M-56.jpg', '/public/images/(P)M-56-1.jpg', '/public/images/(P)M-56-2.jpg', '/public/images/(P)M-56-3.jpg'];
            } else if (idLower.includes('-s-') || idLower === 'pant-s' || idLower.includes('s-62') || nameLower.includes('(s)') || nameLower.includes('(small)') || nameLower.includes('small')) {
              images = [primaryImg || '/public/images/(P)S-62.jpg', '/public/images/(P)S-62-1.jpg', '/public/images/(P)S-62-2.jpg', '/public/images/(P)S-62-3.jpg'];
            } else {
              images = primaryImg ? [primaryImg] : [];
            }
          } else if (isVelcro) {
            if (idLower.includes('pb') || nameLower.includes('prematur') || nameLower.includes('pb') || idLower.includes('pb-30')) {
              images = [primaryImg || '/public/images/(V)PB-30.png', '/public/images/(V)PB-30-1.jpg', '/public/images/(V)PB-30-2.jpg', '/public/images/(V)PB-30-3.jpg'];
            } else if (idLower.includes('nb') || nameLower.includes('newborn') || nameLower.includes('nb') || idLower.includes('nb-72') || idLower.includes('nb-36')) {
              images = [primaryImg || '/public/images/(V)NB-72.jpg', '/public/images/(V)NB-72-1.jpg', '/public/images/(V)NB-72-2.jpg', '/public/images/(V)NB-72-3.jpg'];
            } else if (idLower.includes('-s-') || idLower.includes('s-62') || nameLower.includes('(s)') || nameLower.includes('(small)') || nameLower.includes('small')) {
              images = [primaryImg || '/public/images/(V)S-62.jpg', '/public/images/(V)S-62-1.jpg', '/public/images/(V)S-62-2.jpg', '/public/images/(V)S-62-3.jpg'];
            } else if (idLower.includes('-m-') || idLower.includes('m-52') || nameLower.includes('(m)') || nameLower.includes('(medium)') || nameLower.includes('medium')) {
              images = [primaryImg || '/public/images/(V)M-52.jpg', '/public/images/(V)M-52-1.jpg', '/public/images/(V)M-52-2.jpg', '/public/images/(V)M-52-3.jpg'];
            } else {
              images = primaryImg ? [primaryImg] : [];
            }
          } else {
            images = primaryImg ? [primaryImg] : [];
          }
        }

        return {
          ...p,
          active: p.active === 1 || p.active === true,
          stockStatus: p.stockstatus,
          imageFallback: p.imagefallback,
          sellingPrice: parseFloat(p.sellingprice) || 0,
          mrp: parseFloat(p.mrp) || 0,
          imageUrl: p.imageurl,
          images: images,
          packSize: p.packsize,
          totalSold: parseInt(p.totalsold) || 0
        };
      });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      let { id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, active, imageUrl, images, category } = req.body;
      imageUrl = saveBase64Image(id, imageUrl);
      const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (images || null);
      await pool.query(
        `INSERT INTO Product (id, name, packSize, mrp, sellingPrice, discount, description, imageFallback, stock, stockStatus, totalSold, active, imageUrl, images, category) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, $12, $13, $14)`,
        [id, name, packSize || '1', mrp || 0, sellingPrice || 0, discount || 0, description || '', imageFallback || '', stock || 0, stockStatus || 'IN_STOCK', active === false ? 0 : 1, imageUrl || '', imagesJson, category || 'Pant-Style']
      );
      res.status(201).json({ success: true, imageUrl, images });
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
      const { name, packSize, mrp, sellingPrice, discount, description, stock, stockStatus, active, imageUrl, images, category } = req.body;
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
      if (images !== undefined) { 
        updates.push(`images = $${idx++}`); 
        values.push(Array.isArray(images) ? JSON.stringify(images) : images); 
      }
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
