import Attendance from "../Models/Attendance.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Classes from "../Models/Classes.js";
import Fee from "../Models/Fee.js";
import Invoice from "../Models/Invoice.js";
import Messages from "../Models/Messages.js";
import RefreshToken from "../Models/RefreshToken.js";
import Students from "../Models/Students.js";
import Teachers from "../Models/Teachers.js";

export const deleteStudentCascade = async (studentId) => {
  const student = await Students.findById(studentId).select("_id classes appliedClasses");
  if (!student) {
    return null;
  }

  const id = student._id;

  await Classes.updateMany(
    { enrolledStudents: id },
    { $pull: { enrolledStudents: id } }
  );
  await Classes.updateMany(
    { appliedStudents: id },
    { $pull: { appliedStudents: id } }
  );
  await Teachers.updateMany({ myStudents: id }, { $pull: { myStudents: id } });

  await Attendance.deleteMany({ studentId: id });
  await Fee.deleteMany({ studentId: id });
  await Invoice.deleteMany({ studentId: id });
  await ClassAccessStatus.deleteMany({ studentId: id });
  await RefreshToken.deleteMany({ userId: id, role: "student" });
  await Messages.deleteMany({
    $or: [{ senderId: id }, { receiverId: id }],
  });

  await Students.findByIdAndDelete(id);

  return student;
};

export const deleteAllStudentsCascade = async () => {
  const students = await Students.find({}, "_id");
  if (!students.length) {
    return { deletedCount: 0 };
  }

  const ids = students.map((student) => student._id);

  await Classes.updateMany(
    {
      $or: [
        { enrolledStudents: { $in: ids } },
        { appliedStudents: { $in: ids } },
      ],
    },
    {
      $pull: {
        enrolledStudents: { $in: ids },
        appliedStudents: { $in: ids },
      },
    }
  );

  await Teachers.updateMany(
    { myStudents: { $in: ids } },
    { $pull: { myStudents: { $in: ids } } }
  );

  await Attendance.deleteMany({ studentId: { $in: ids } });
  await Fee.deleteMany({ studentId: { $in: ids } });
  await Invoice.deleteMany({ studentId: { $in: ids } });
  await ClassAccessStatus.deleteMany({ studentId: { $in: ids } });
  await RefreshToken.deleteMany({ userId: { $in: ids }, role: "student" });
  await Messages.deleteMany({
    $or: [{ senderId: { $in: ids } }, { receiverId: { $in: ids } }],
  });

  await Students.deleteMany({ _id: { $in: ids } });

  return { deletedCount: ids.length };
};
