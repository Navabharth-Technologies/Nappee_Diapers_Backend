const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgres://nappee_db_user:A5po9SYOqeMqDHUWHO3LkkvFZPWGwxDP@dpg-da5uv1ojo6nc73dq9j6g-a.oregon-postgres.render.com:5432/nappee_db', ssl: { rejectUnauthorized: false } }); 
pool.query("UPDATE \"Order\" SET paymentStatus = 'PAID', status = 'PROCESSING' WHERE paymentStatus = 'PENDING' AND status = 'PENDING_PAYMENT'").then(res => { 
  console.log(res.rowCount + ' orders updated manually'); 
  pool.end(); 
}).catch(console.error);
