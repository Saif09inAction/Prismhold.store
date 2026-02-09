require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prismhold';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    displayName: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB\n');
        
        const email = 'admin@gmail.com';
        const password = 'admin12';
        const displayName = 'Admin';
        
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            // Update existing user to admin
            existingUser.isAdmin = true;
            existingUser.password = await bcrypt.hash(password, 10);
            if (displayName) {
                existingUser.displayName = displayName;
            }
            await existingUser.save();
            console.log('✅ Existing user updated to admin');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${password}`);
            console.log(`   Display Name: ${displayName}`);
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = new User({
                email,
                password: hashedPassword,
                displayName,
                isAdmin: true
            });
            await admin.save();
            console.log('✅ Admin user created successfully');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${password}`);
            console.log(`   Display Name: ${displayName}`);
        }
        
        await mongoose.connection.close();
        console.log('\n✅ Done! You can now login with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 11000) {
            console.error('   Email already exists. Updating existing user...');
        }
        process.exit(1);
    }
}

createAdmin();
