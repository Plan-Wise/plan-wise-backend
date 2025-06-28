import { database } from '../src/config/database';

async function healthCheck() {
  console.log('🔍 Running health check...\n');

  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const dbConnected = await database.testConnection();
    if (dbConnected) {
      console.log('✅ Database connection: OK');
    } else {
      console.log('❌ Database connection: FAILED');
    }

    // Test categories table
    console.log('📋 Testing categories table...');
    const categories = await database.query('SELECT COUNT(*) as count FROM categories');
    console.log(`✅ Categories table: ${categories[0].count} categories found`);

    // Test basic table structure
    console.log('🏗️  Testing table structure...');
    const tables = await database.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables in database`);

    console.log('\n🎉 Health check completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env file with your actual database credentials');
    console.log('2. Update .env file with your Gmail credentials for email');
    console.log('3. Get a Gemini API key from Google AI Studio');
    console.log('4. Run: npm run dev');
    console.log('5. Test the API endpoints with Postman or similar tool');

  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your database credentials in .env');
    console.log('3. Run the schema.sql file to create tables:');
    console.log('   mysql -u your_username -p financial_management < database/schema.sql');
  }

  await database.close();
  process.exit(0);
}

healthCheck();
