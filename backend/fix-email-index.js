#!/usr/bin/env node
/**
 * One-time fix: Drop non-sparse email_1 index so phone-only users can sign up.
 * Run from project root: node backend/fix-email-index.js
 * Requires MONGO_URI or MONGODB_URI in .env
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
  if (emailIdx && !emailIdx.sparse) {
    await coll.dropIndex('email_1');
    console.log('Dropped email_1 index. Phone login should work now.');
  } else {
    console.log('email_1 index is already sparse or does not exist.');
  }
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
