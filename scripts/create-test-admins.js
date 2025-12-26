/**
 * Script to create test admin and staff users
 * Run: node scripts/create-test-admins.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff',
        required: true
    },
});

async function createTestAdmins() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        // Create admin user
        const adminUser = await Admin.findOneAndUpdate(
            { username: 'admin' },
            {
                username: 'admin',
                password: 'admin123',  // Note: Use hashing in production!
                role: 'admin'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Created/Updated admin user:', adminUser.username, '- Role:', adminUser.role);

        // Create staff user
        const staffUser = await Admin.findOneAndUpdate(
            { username: 'staff' },
            {
                username: 'staff',
                password: 'staff123',  // Note: Use hashing in production!
                role: 'staff'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Created/Updated staff user:', staffUser.username, '- Role:', staffUser.role);

        console.log('\n📋 Test Credentials:');
        console.log('   Admin - username: admin, password: admin123');
        console.log('   Staff - username: staff, password: staff123');
        console.log('\n🔐 Permissions:');
        console.log('   Admin: Full access to all features');
        console.log('   Staff: No access to user management');

        await mongoose.disconnect();
        console.log('\n✅ Done! Database connection closed.');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestAdmins();
