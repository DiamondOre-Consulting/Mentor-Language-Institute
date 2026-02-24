import Attendance from "../Models/Attendance.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Classes from "../Models/Classes.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import Commission from "../Models/Commission.js";
import Fee from "../Models/Fee.js";
import Invoice from "../Models/Invoice.js";
import Students from "../Models/Students.js";

export const deleteAllCoursesCascade = async () => {
  const courses = await Classes.find({}, "_id");
  if (!courses.length) {
    return { deletedCount: 0 };
  }

  const ids = courses.map((course) => course._id);

  await Students.updateMany(
    {
      $or: [{ classes: { $in: ids } }, { appliedClasses: { $in: ids } }],
    },
    {
      $pull: {
        classes: { $in: ids },
        appliedClasses: { $in: ids },
      },
    }
  );

  await ClassTeachers.deleteMany({ classId: { $in: ids } });

  const attendanceIds = await Attendance.find({ classId: { $in: ids } }).distinct(
    "_id"
  );
  const feeIds = await Fee.find({ classId: { $in: ids } }).distinct("_id");

  await Attendance.deleteMany({ classId: { $in: ids } });
  await Fee.deleteMany({ classId: { $in: ids } });
  await Invoice.deleteMany({ classId: { $in: ids } });
  await ClassAccessStatus.deleteMany({ classId: { $in: ids } });
  await Commission.deleteMany({ classId: { $in: ids } });

  if (attendanceIds.length > 0) {
    await Students.updateMany(
      { attendanceDetail: { $in: attendanceIds } },
      { $pull: { attendanceDetail: { $in: attendanceIds } } }
    );
  }
  if (feeIds.length > 0) {
    await Students.updateMany(
      { feeDetail: { $in: feeIds } },
      { $pull: { feeDetail: { $in: feeIds } } }
    );
  }

  await Classes.deleteMany({ _id: { $in: ids } });

  return { deletedCount: ids.length };
};
