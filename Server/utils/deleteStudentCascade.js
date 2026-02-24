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
