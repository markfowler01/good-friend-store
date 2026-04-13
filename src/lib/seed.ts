/**
 * Seed script to create an initial admin user.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' src/lib/seed.ts
 *
 * Or add to package.json scripts:
 *   "seed": "npx ts-node --compiler-options '{\"module\":\"commonjs\"}' src/lib/seed.ts"
 *
 * You can also use the API to create the first admin user:
 *   1. Temporarily comment out the auth check in /api/auth/register
 *   2. POST to /api/auth/register with { name, email, password, role: "admin" }
 *   3. Uncomment the auth check
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "";

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const User = mongoose.model(
    "User",
    new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      passwordHash: String,
      role: { type: String, default: "helper" },
    })
  );

  const adminEmail = "admin@bcachurch.com";
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log("Admin user already exists");
  } else {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user: ${adminEmail} / admin123`);
    console.log("IMPORTANT: Change the password after first login!");
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);
