const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔌 Connecting to DB...');
    console.log('Using DB URL:', connectionString);

    await client.connect();

    console.log('✅ Connected successfully!');

    const res = await client.query('SELECT NOW()');
    console.log('🕒 DB Time:', res.rows[0]);
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err.message);
  } finally {
    await client.end();
    console.log('🔚 Connection closed');
  }
}

testConnection();
