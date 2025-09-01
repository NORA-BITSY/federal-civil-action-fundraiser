const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Get current database name
    const dbNameResult = await prisma.$queryRaw`SELECT current_database() as db_name`;
    console.log('Current database:', dbNameResult[0].db_name);

    // Check if campaigns table exists
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'campaign'
      `;
      console.log('Campaigns table exists:', tableCheck.length > 0);
    } catch (error) {
      console.log('Error checking campaigns table:', error.message);
    }

    // Try to count campaigns
    try {
      const campaignCount = await prisma.campaign.count();
      console.log('Campaign count:', campaignCount);
    } catch (error) {
      console.log('Error counting campaigns:', error.message);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

