#!/usr/bin/env node
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "kids-data.json");
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set — put it in .env.local at the project root");
  process.exit(1);
}

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, enum: ["K", "1", "2", "3", "4", "5", null], default: null },
    uniqueId: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
    },
    barcodeId: { type: String, trim: true },
    ticketBalance: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

function uid() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function ensureIndexes(col) {
  const existing = await col.indexes();
  const stale = existing.find(
    (i) => i.name === "barcodeId_1" && !i.partialFilterExpression
  );
  if (stale) {
    console.log("Dropping stale barcodeId_1 index (sparse — allowed only one null)");
    await col.dropIndex("barcodeId_1");
  }
  // Nuke docs that stored barcodeId: null (they'll get re-imported properly)
  const nullRes = await col.updateMany(
    { barcodeId: null },
    { $unset: { barcodeId: "" } }
  );
  if (nullRes.modifiedCount) {
    console.log(`Unset barcodeId on ${nullRes.modifiedCount} docs that had null`);
  }
  await col.createIndex(
    { barcodeId: 1 },
    { unique: true, partialFilterExpression: { barcodeId: { $type: "string" } } }
  );
}

async function main() {
  const kids = JSON.parse(readFileSync(dataPath, "utf8"));
  console.log(`Loading ${kids.length} kids from ${dataPath}`);

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await ensureIndexes(mongoose.connection.db.collection("students"));

  const ops = kids
    .filter((k) => k.name && k.name.trim())
    .map((k) => {
      const name = k.name.trim();
      const isActive = k.isActive !== false;
      const set = {
        name,
        ticketBalance: Number(k.ticketBalance) || 0,
        isActive,
      };
      const unset = {};

      if (k.barcodeId) {
        set.barcodeId = String(k.barcodeId).trim();
      } else {
        unset.barcodeId = "";
      }

      const filter = k.barcodeId
        ? { barcodeId: String(k.barcodeId).trim() }
        : { name, isActive, barcodeId: { $exists: false } };

      const update = { $set: set, $setOnInsert: { uniqueId: uid() } };
      if (Object.keys(unset).length) update.$unset = unset;

      return {
        updateOne: { filter, update, upsert: true },
      };
    });

  console.log(`Running ${ops.length} bulk upserts...`);
  const result = await Student.bulkWrite(ops, { ordered: false });

  console.log(
    `Done — upserted: ${result.upsertedCount}, matched: ${result.matchedCount}, modified: ${result.modifiedCount}`
  );

  const col = mongoose.connection.db.collection("students");
  const active = await col.countDocuments({ isActive: true });
  const inactive = await col.countDocuments({ isActive: false });
  const total = await col.countDocuments();
  console.log(`DB totals — active: ${active}, inactive: ${inactive}, total: ${total}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
