#!/usr/bin/env node
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI missing"); process.exit(1); }

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;
const colls = await db.listCollections().toArray();
console.log("Collections:", colls.map((c) => c.name));

for (const { name } of colls) {
  const count = await db.collection(name).countDocuments();
  console.log(`  ${name}: ${count} docs`);
}

if (colls.find((c) => c.name === "students")) {
  const sample = await db.collection("students").find().limit(5).toArray();
  console.log("\nSample students:");
  for (const s of sample) {
    console.log(`  - ${s.name} (${s.barcodeId ?? "no-barcode"}) bal=${s.ticketBalance} active=${s.isActive}`);
  }
}

await mongoose.disconnect();
