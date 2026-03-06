import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Students from "../Models/Students.js";
import Classes from "../Models/Classes.js";
import Fee from "../Models/Fee.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import { normalizeFeeMonth } from "../utils/fee.js";

dotenv.config();

const getArgValue = (flag, fallback) => {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const value = process.argv[idx + 1];
  return value !== undefined ? value : fallback;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const main = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  const count = Math.max(1, parseNumber(getArgValue("--count", "50"), 50));
  const prefix = String(getArgValue("--prefix", "seed-student")).trim() || "seed-student";
  const totalFee = Math.max(0, parseNumber(getArgValue("--fee", "3000"), 3000));
  const password = String(getArgValue("--password", "Student@123")).trim() || "Student@123";

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const classes = await Classes.find({}).lean();
  if (!classes.length) {
    console.warn("No classes found. Seed aborted.");
    await mongoose.disconnect();
    return;
  }

  const emailRegex = new RegExp(`^${prefix}\\d+@`, "i");
  const existingSeedStudents = await Students.find({ email: emailRegex })
    .select("_id name email phone userName")
    .lean();

  const existingAll = await Students.find({})
    .select("email phone userName")
    .lean();

  const existingByEmail = new Set(existingAll.map((s) => s.email));
  const existingByPhone = new Set(existingAll.map((s) => s.phone));
  const existingByUserName = new Set(existingAll.map((s) => s.userName));

  const studentsToCreate = [];
  const basePhone = 9000000000;
  let index = 1;

  while (existingSeedStudents.length + studentsToCreate.length < count) {
    const email = `${prefix}${index}@example.com`;
    const userName = `${prefix}${index}`;
    let phone = String(basePhone + index);

    while (existingByPhone.has(phone)) {
      phone = String(Number(phone) + 1);
    }

    if (!existingByEmail.has(email) && !existingByUserName.has(userName)) {
      existingByEmail.add(email);
      existingByUserName.add(userName);
      existingByPhone.add(phone);

      studentsToCreate.push({
        name: `Seed Student ${index}`,
        phone,
        email,
        userName,
        grade: "All levels",
        password,
      });
    }

    index += 1;
  }

  if (studentsToCreate.length) {
    const hashed = await bcrypt.hash(password, 10);
    studentsToCreate.forEach((s) => {
      s.password = hashed;
    });
    await Students.insertMany(studentsToCreate);
    console.log(`Created ${studentsToCreate.length} students.`);
  } else {
    console.log("No new students needed. Using existing seed students.");
  }

  const seedStudents = await Students.find({ email: emailRegex })
    .select("_id name email")
    .lean();

  if (!seedStudents.length) {
    console.warn("No seed students available after creation. Seed aborted.");
    await mongoose.disconnect();
    return;
  }

  const studentIds = seedStudents.map((s) => s._id);
  const currentMonth = normalizeFeeMonth(new Date().getMonth() + 1);

  for (const course of classes) {
    await Classes.updateOne(
      { _id: course._id },
      { $addToSet: { enrolledStudents: { $each: studentIds } } }
    );

    await Students.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { classes: course._id } }
    );

    const feeOps = [];
    for (const studentId of studentIds) {
      feeOps.push({
        updateOne: {
          filter: { classId: course._id, studentId },
          update: {
            $set: { totalFee },
            $setOnInsert: { classId: course._id, studentId, detailFee: [] },
          },
          upsert: true,
        },
      });
      if (currentMonth) {
        feeOps.push({
          updateOne: {
            filter: {
              classId: course._id,
              studentId,
              "detailFee.feeMonth": { $ne: currentMonth },
            },
            update: {
              $push: {
                detailFee: {
                  feeMonth: currentMonth,
                  paid: false,
                  amountPaid: 0,
                },
              },
            },
          },
        });
      }
    }
    if (feeOps.length) {
      await Fee.bulkWrite(feeOps);
    }

    const feesForClass = await Fee.find({
      classId: course._id,
      studentId: { $in: studentIds },
    }).select("_id studentId");

    const feeMap = new Map();
    feesForClass.forEach((fee) => {
      feeMap.set(String(fee.studentId), fee._id);
    });

    const studentOps = studentIds
      .map((studentId) => {
        const feeId = feeMap.get(String(studentId));
        if (!feeId) return null;
        return {
          updateOne: {
            filter: { _id: studentId },
            update: { $addToSet: { feeDetail: feeId } },
          },
        };
      })
      .filter(Boolean);
    if (studentOps.length) {
      await Students.bulkWrite(studentOps);
    }

    const accessOps = studentIds.map((studentId) => ({
      updateOne: {
        filter: { classId: course._id, studentId },
        update: {
          $set: { classAccessStatus: true },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    }));
    if (accessOps.length) {
      await ClassAccessStatus.bulkWrite(accessOps);
    }
  }

  console.log(
    `Enrolled ${studentIds.length} students into ${classes.length} course(s).`
  );

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("Seed failed:", error);
  mongoose.disconnect().finally(() => process.exit(1));
});
