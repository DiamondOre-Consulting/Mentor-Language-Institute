import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Students from "../Models/Students.js";
import Classes from "../Models/Classes.js";
import Fee from "../Models/Fee.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import { normalizeFeeMonth } from "../utils/fee.js";
import { resolveCourseGrade, toGradeLabel } from "../utils/grade.js";

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

const firstNames = [
  "Aarav",
  "Aditi",
  "Akash",
  "Alok",
  "Aman",
  "Ananya",
  "Anika",
  "Ankit",
  "Ansh",
  "Arjun",
  "Arnav",
  "Ashish",
  "Avni",
  "Bhavya",
  "Deepak",
  "Divya",
  "Gaurav",
  "Isha",
  "Ishita",
  "Kabir",
  "Karan",
  "Kavya",
  "Kiran",
  "Krish",
  "Kriti",
  "Manav",
  "Meera",
  "Mohit",
  "Neha",
  "Nikhil",
  "Pooja",
  "Pranav",
  "Priya",
  "Rahul",
  "Ria",
  "Rohan",
  "Rohit",
  "Sakshi",
  "Sameer",
  "Sanya",
  "Shreya",
  "Siddharth",
  "Sneha",
  "Sohan",
  "Tanya",
  "Varun",
  "Vidya",
  "Vivaan",
  "Yash",
  "Zoya",
  "Aditya",
  "Ayesha",
  "Chirag",
  "Disha",
  "Eshan",
  "Harsh",
  "Irfan",
  "Jatin",
  "Kunal",
  "Lavanya",
  "Madhav",
  "Naina",
  "Ojas",
  "Payal",
  "Reyansh",
  "Ritika",
  "Samar",
  "Tanvi",
  "Udit",
  "Ved",
  "Yuvraj",
];

const lastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Patel",
  "Kumar",
  "Mehta",
  "Iyer",
  "Rao",
  "Nair",
  "Das",
  "Chatterjee",
  "Banerjee",
  "Kapoor",
  "Bhat",
  "Reddy",
  "Malhotra",
  "Jain",
  "Ghosh",
  "Kulkarni",
  "Joshi",
  "Jha",
  "Pandey",
  "Saxena",
  "Agarwal",
  "Mishra",
  "Yadav",
  "Tripathi",
  "Mathur",
  "Bansal",
  "Khanna",
  "Chopra",
  "Bhatt",
  "Kaur",
  "Sethi",
  "Chaudhary",
  "Prasad",
  "Shetty",
  "Menon",
  "Sengupta",
  "Bose",
  "Lal",
  "Thakur",
  "Shah",
  "Chawla",
  "Srinivasan",
  "Rastogi",
  "Desai",
  "Dutta",
];

const emailDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "rediffmail.com",
  "icloud.com",
];

const gradeCycle = [6, 7, 8, 9, 10, 11, 12].map((num) => toGradeLabel(num));

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");

const uniqueWithSuffix = (base, usedSet, separator = ".") => {
  let candidate = base;
  let counter = 1;
  while (usedSet.has(candidate)) {
    counter += 1;
    candidate = `${base}${separator}${counter}`;
  }
  usedSet.add(candidate);
  return candidate;
};

const uniqueEmail = (baseLocal, domain, usedSet) => {
  let local = baseLocal;
  let counter = 1;
  let email = `${local}@${domain}`;
  while (usedSet.has(email)) {
    counter += 1;
    local = `${baseLocal}.${counter}`;
    email = `${local}@${domain}`;
  }
  usedSet.add(email);
  return email;
};

const generatePhone = (usedSet) => {
  while (true) {
    const firstDigit = [6, 7, 8, 9][randomInt(0, 3)];
    const rest = String(randomInt(0, 999999999)).padStart(9, "0");
    const phone = `${firstDigit}${rest}`;
    if (!usedSet.has(phone)) {
      usedSet.add(phone);
      return phone;
    }
  }
};

const deriveDobForGrade = (gradeLabel) => {
  const currentYear = new Date().getFullYear();
  const gradeNum = parseInt(String(gradeLabel), 10);
  const age = Number.isFinite(gradeNum)
    ? gradeNum + 5 + randomInt(0, 1)
    : randomInt(13, 19);
  const year = currentYear - age;
  const month = randomInt(0, 11);
  const day = randomInt(1, 28);
  return new Date(year, month, day);
};

const pickPaymentStatus = (index) => {
  const cycle = ["pending", "partial", "paid"];
  return cycle[index % cycle.length];
};

const randomFee = (min, max) => {
  const step = 500;
  const range = Math.max(step, max - min);
  const value = min + Math.floor(Math.random() * (range / step + 1)) * step;
  return Math.max(step, value);
};

const main = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  const count = Math.max(80, parseNumber(getArgValue("--count", "80"), 80));
  const feeMin = Math.max(1000, parseNumber(getArgValue("--feeMin", "12000"), 12000));
  const feeMax = Math.max(feeMin, parseNumber(getArgValue("--feeMax", "18000"), 18000));
  const passwordPlain = "1234";

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const classes = await Classes.find({}).lean();
  if (!classes.length) {
    console.warn("No classes found. Seed aborted.");
    await mongoose.disconnect();
    return;
  }

  const classPool = classes.map((course) => ({
    ...course,
    resolvedGrade: resolveCourseGrade(course),
  }));

  const existingAll = await Students.find({}).select("email phone userName").lean();
  const existingByEmail = new Set(existingAll.map((s) => s.email));
  const existingByPhone = new Set(existingAll.map((s) => s.phone));
  const existingByUserName = new Set(existingAll.map((s) => s.userName));

  const usedNames = new Set();
  const studentDrafts = [];

  while (studentDrafts.length < count) {
    const first = firstNames[randomInt(0, firstNames.length - 1)];
    const last = lastNames[randomInt(0, lastNames.length - 1)];
    const name = `${first} ${last}`;
    if (usedNames.has(name)) {
      continue;
    }
    usedNames.add(name);

    const primaryClass = classPool[studentDrafts.length % classPool.length];
    const grade = primaryClass?.resolvedGrade || gradeCycle[studentDrafts.length % gradeCycle.length];
    const dob = deriveDobForGrade(grade);

    const baseSlug = slugify(`${first}.${last}`);
    const userName = uniqueWithSuffix(baseSlug, existingByUserName, ".");
    const emailDomain = emailDomains[randomInt(0, emailDomains.length - 1)];
    const email = uniqueEmail(baseSlug, emailDomain, existingByEmail);
    const phone = generatePhone(existingByPhone);

    const secondaryClass =
      classPool.length > 1 && studentDrafts.length % 4 === 0
        ? classPool[(studentDrafts.length + 1) % classPool.length]
        : null;

    const classIds = [primaryClass?._id].filter(Boolean);
    if (secondaryClass && String(secondaryClass._id) !== String(primaryClass._id)) {
      classIds.push(secondaryClass._id);
    }

    studentDrafts.push({
      doc: {
        branch: "Main",
        name,
        dob,
        grade,
        phone,
        email,
        userName,
        password: passwordPlain,
        classes: [],
      },
      classIds,
    });
  }

  const hashed = await bcrypt.hash(passwordPlain, 10);
  const docsToInsert = studentDrafts.map((draft) => ({
    ...draft.doc,
    password: hashed,
  }));

  const insertedStudents = await Students.insertMany(docsToInsert);
  console.log(`Created ${insertedStudents.length} students.`);

  const classToStudents = new Map();
  insertedStudents.forEach((student, idx) => {
    const classIds = studentDrafts[idx].classIds;
    classIds.forEach((classId) => {
      const key = String(classId);
      if (!classToStudents.has(key)) {
        classToStudents.set(key, []);
      }
      classToStudents.get(key).push(student._id);
    });
  });

  const currentMonth = normalizeFeeMonth(new Date().getMonth() + 1);
  const feeDocs = [];
  const accessDocs = [];

  for (const [classId, studentIds] of classToStudents.entries()) {
    if (!studentIds.length) continue;

    await Classes.updateOne(
      { _id: classId },
      { $addToSet: { enrolledStudents: { $each: studentIds } } }
    );

    await Students.bulkWrite(
      studentIds.map((studentId) => ({
        updateOne: {
          filter: { _id: studentId },
          update: { $addToSet: { classes: classId } },
        },
      }))
    );

    studentIds.forEach((studentId, idx) => {
      const totalFee = randomFee(feeMin, feeMax);
      const status = pickPaymentStatus(idx);
      let amountPaid = 0;
      let paid = false;
      if (status === "partial") {
        amountPaid = Math.max(500, Math.floor(totalFee * 0.4));
      } else if (status === "paid") {
        amountPaid = totalFee;
        paid = true;
      }

      feeDocs.push({
        classId,
        studentId,
        totalFee,
        detailFee: currentMonth
          ? [
              {
                feeMonth: currentMonth,
                paid,
                amountPaid,
              },
            ]
          : [],
      });

      accessDocs.push({
        classId,
        studentId,
        classAccessStatus: true,
        createdAt: new Date(),
      });
    });
  }

  const insertedFees = feeDocs.length ? await Fee.insertMany(feeDocs) : [];
  const feeByStudent = new Map();
  insertedFees.forEach((fee) => {
    const key = String(fee.studentId);
    if (!feeByStudent.has(key)) {
      feeByStudent.set(key, []);
    }
    feeByStudent.get(key).push(fee._id);
  });

  if (feeByStudent.size) {
    await Students.bulkWrite(
      Array.from(feeByStudent.entries()).map(([studentId, feeIds]) => ({
        updateOne: {
          filter: { _id: studentId },
          update: { $addToSet: { feeDetail: { $each: feeIds } } },
        },
      }))
    );
  }

  if (accessDocs.length) {
    await ClassAccessStatus.insertMany(accessDocs);
  }

  console.log(
    `Enrolled students into ${classToStudents.size} course(s) with mixed payment statuses.`
  );

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("Seed failed:", error);
  mongoose.disconnect().finally(() => process.exit(1));
});
