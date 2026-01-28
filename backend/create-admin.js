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
        
        console.log('Connected to MongoDB');
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question('Enter admin email: ', async (email) => {
            readline.question('Enter admin password: ', async (password) => {
                readline.question('Enter admin name: ', async (displayName) => {
                    const existingUser = await User.findOne({ email });
                    
                    if (existingUser) {
                        // Update existing user to admin
                        existingUser.isAdmin = true;
                        if (password) {
                            existingUser.password = await bcrypt.hash(password, 10);
                        }
                        await existingUser.save();
                        console.log('✅ Existing user updated to admin');
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
                    }
                    
                    readline.close();
                    await mongoose.connection.close();
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();


