const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ryfeyqksqngpslyxrynl:SoftwareArchitecture0987@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
});
async function drop() {
  await client.connect();
  await client.query('DROP TABLE IF EXISTS fine_reasons CASCADE;');
  await client.query('DROP TABLE IF EXISTS fines CASCADE;');
  console.log('Dropped fines tables');
  await client.end();
}
drop();
