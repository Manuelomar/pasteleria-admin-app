const { DataSource } = require('typeorm');
const path = require('path');
const dbPath = path.resolve('pasteleria-backend/database.sqlite');
console.log(dbPath);
const ds = new DataSource({ type: 'sqlite', database: dbPath });
ds.initialize().then(async () => {
    const res = await ds.query(`
        SELECT nombre, productoId, SUM(cantidad) as cantidad, SUM(cantidad * precio) as total
        FROM venta_items
        GROUP BY nombre, productoId
        ORDER BY SUM(cantidad) DESC
    `);
    console.log(res);
    process.exit(0);
});
