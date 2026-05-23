import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres.fypubeiwjnwnbchbrdde:AlloHealth2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=no-verify"
});

const sql = `
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    await client.query(sql);
    console.log('Column imageUrl added successfully');
  } catch (err) {
    console.error('Error adding column', err);
  } finally {
    await client.end();
  }
}

run();
