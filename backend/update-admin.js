require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    displayName: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function updateAdmin() {
    if (!MONGO_URI) {
        console.error('Set MONGO_URI or MONGODB_URI in .env');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB\n');
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // Get current admin email
        readline.question('Enter CURRENT admin email: ', async (currentEmail) => {
            const existingAdmin = await User.findOne({ email: currentEmail, isAdmin: true });
            
            if (!existingAdmin) {
                console.error('❌ Admin user not found with that email.');
                console.log('💡 Tip: Run "npm run create-admin" to create a new admin user.');
                readline.close();
                await mongoose.connection.close();
                process.exit(1);
            }
            
            console.log(`\n✅ Found admin user: ${existingAdmin.email}`);
            console.log(`   Display Name: ${existingAdmin.displayName || 'Not set'}\n`);
            
            // Get new email
            readline.question('Enter NEW email (or press Enter to keep current): ', async (newEmail) => {
                // Get new password
                readline.question('Enter NEW password (or press Enter to keep current): ', async (newPassword) => {
                    // Get new display name
                    readline.question('Enter NEW display name (or press Enter to keep current): ', async (newDisplayName) => {
                        try {
                            // Check if new email is already taken by another user
                            if (newEmail && newEmail.trim() && newEmail !== currentEmail) {
                                const emailTaken = await User.findOne({ 
                                    email: newEmail.trim(),
                                    _id: { $ne: existingAdmin._id }
                                });
                                
                                if (emailTaken) {
                                    console.error(`\n❌ Email "${newEmail}" is already taken by another user.`);
                                    readline.close();
                                    await mongoose.connection.close();
                                    process.exit(1);
                                }
                                
                                existingAdmin.email = newEmail.trim();
                                console.log(`✅ Email updated to: ${newEmail.trim()}`);
                            }
                            
                            // Update password if provided
                            if (newPassword && newPassword.trim()) {
                                existingAdmin.password = await bcrypt.hash(newPassword.trim(), 10);
                                console.log('✅ Password updated');
                            }
                            
                            // Update display name if provided
                            if (newDisplayName && newDisplayName.trim()) {
                                existingAdmin.displayName = newDisplayName.trim();
                                console.log(`✅ Display name updated to: ${newDisplayName.trim()}`);
                            }
                            
                            // Ensure user remains admin
                            existingAdmin.isAdmin = true;
                            
                            await existingAdmin.save();
                            
                            console.log('\n✅ Admin user updated successfully!');
                            console.log(`\n📧 Email: ${existingAdmin.email}`);
                            console.log(`👤 Display Name: ${existingAdmin.displayName || 'Not set'}`);
                            console.log(`🔑 Password: ${newPassword && newPassword.trim() ? 'Updated' : 'Unchanged'}`);
                            
                        } catch (error) {
                            console.error('\n❌ Error updating admin:', error.message);
                            if (error.code === 11000) {
                                console.error('   Email is already taken by another user.');
                            }
                        }
                        
                        readline.close();
                        await mongoose.connection.close();
                        process.exit(0);
                    });
                });
            });
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAdmin();
