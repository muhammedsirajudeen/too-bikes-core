/**
 * Quick script to verify staff user has correct role
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkStaffUser() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const admins = db.collection('admins');

        // Check if staff user exists
        const staffUser = await admins.findOne({ username: 'staff' });

        if (staffUser) {
            console.log('\n✅ Staff user found:');
            console.log('   Username:', staffUser.username);
            console.log('   Role:', staffUser.role);
            console.log('   Password:', staffUser.password);

            if (staffUser.role !== 'staff') {
                console.log('\n⚠️  Updating staff user role to "staff"...');
                await admins.updateOne(
                    { username: 'staff' },
                    { $set: { role: 'staff' } }
                );
                console.log('✅ Role updated');
            }
        } else {
            console.log('\n❌ Staff user not found. Creating...');
            await admins.insertOne({
                username: 'staff',
                password: 'staff123',
                role: 'staff'
            });
            console.log('✅ Staff user created');
        }

        // Check admin user
        const adminUser = await admins.findOne({ username: 'admin' });

        if (adminUser) {
            console.log('\n✅ Admin user found:');
            console.log('   Username:', adminUser.username);
            console.log('   Role:', adminUser.role);

            if (adminUser.role !== 'admin') {
                console.log('\n⚠️  Updating admin user role to "admin"...');
                await admins.updateOne(
                    { username: 'admin' },
                    { $set: { role: 'admin' } }
                );
                console.log('✅ Role updated');
            }
        } else {
            console.log('\n❌ Admin user not found. Creating...');
            await admins.insertOne({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Admin user created');
        }

        console.log('\n✅ All done!');
        console.log('\nLogin credentials:');
        console.log('  Admin: admin / admin123');
        console.log('  Staff: staff / staff123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

checkStaffUser();
