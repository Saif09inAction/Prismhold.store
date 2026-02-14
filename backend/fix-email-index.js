#!/usr/bin/env node
/**
 * One-time fix: Drop non-sparse email_1 index so phone-only users can sign up.
 * Run: npm run fix-email-index
 * IMPORTANT: Use the SAME MONGO_URI as Render. Copy it from Render Dashboard > Environment.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Set MONGO_URI or MONGODB_URI in .env');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  const coll = mongoose.connection.collection('users');
  const indexes = await coll.indexes();
  const emailIdx = indexes.find(i => i.name === 'email_1');
  const dbHost = (mongoose.connection.host || '').split('.')[0];
  console.log('Connected to MongoDB:', dbHost ? `${dbHost}...` : 'OK');
  if (emailIdx) {
    console.log('email_1 found, sparse:', !!emailIdx.sparse);
    try {
      await coll.dropIndex('email_1');
      console.log('Dropped email_1.');
    } catch (e) {
      if ((e.message || '').toLowerCase().includes('index not found')) {
        console.log('email_1 already dropped.');
      } else throw e;
    }
  } else {
    console.log('email_1 does not exist.');
  }
  // Create sparse email index so multiple phone-only users (email: null) can exist
  await coll.createIndex({ email: 1 }, { unique: true, sparse: true });
  console.log('Created sparse email index. Phone OTP login should work now.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
