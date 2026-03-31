const nodes7 = require('nodes7');
require('dotenv').config();

const conn = new nodes7();

const config = {
  port: 102,
  host: process.env.PLC_HOST || '10.80.90.115',
  rack: Number(process.env.PLC_RACK) || 0,
  slot: Number(process.env.PLC_SLOT) || 2,
};

console.log('--- TEST PLC CONNECTION ---');
console.log('Config:', config);

conn.initiateConnection(config, (err) => {
  if (err) {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  }
  
  console.log('✅ Conectado al PLC.');
  
  // DB2.DBX0.0 -> DB2,X0.0
  const tagToRead = 'DB2,X0.0';
  console.log(`Leyendo tag: ${tagToRead}...`);
  
  conn.addItems(tagToRead);
  
  conn.readAllItems((err, values) => {
    if (err) {
      console.error('❌ Error de lectura:', err);
    } else {
      console.log('📊 Valores recibidos:', values);
      console.log(`Resultado de ${tagToRead}:`, values[tagToRead]);
    }
    
    conn.dropConnection(() => {
      console.log('🔌 Desconectado.');
      process.exit(0);
    });
  });
});
