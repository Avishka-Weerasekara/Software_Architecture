const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lvvqhfqciwleshzgdigb:Avish%232000Wee@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
});

async function dropTables() {
  try {
    await client.connect();
    console.log("Connected to Supabase...");
    await client.query('DROP TABLE IF EXISTS citizen_profiles CASCADE;');
    await client.query('DROP TABLE IF EXISTS police_profiles CASCADE;');
    console.log("Successfully dropped the old corrupted tables!");
  } catch (err) {
    console.error("Error dropping tables:", err);
  } finally {
    await client.end();
  }
}

dropTables();
