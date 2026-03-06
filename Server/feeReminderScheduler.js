import cron from "node-cron";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";
import Fee from "./Models/Fee.js";
import Notification from "./Models/Notification.js";
import { normalizeFeeMonth, normalizeFeeYear, formatFeePeriodLabel } from "./utils/fee.js";

const feeReminderScheduler = () => {
  cron.schedule(
    "0 10 * * *",
    async () => {
      // 10 am IST is 4 am UTC
    try {
      const students = await Students.find({}, { password: 0 });

      const now = new Date();
      const currentMonth = now.getMonth() + 1; // Get current month (1-12)
      const currentYear = now.getFullYear();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // const currentYear = new Date().getFullYear(); // Get current year

      for (const student of students) {
        const feeIds = Array.isArray(student.feeDetail)
          ? student.feeDetail
          : [];
        for (const fee of feeIds) {
          const oneFeeDetail = await Fee.findById({ _id: fee });
          if (!oneFeeDetail) {
            continue;
          }
          if (oneFeeDetail.detailFee && Array.isArray(oneFeeDetail.detailFee)) {
            const detailFeeForCurrentMonth = oneFeeDetail.detailFee.find(
              (detail) => {
                const monthValue = normalizeFeeMonth(detail.feeMonth);
                const yearValue = normalizeFeeYear(detail.feeYear) || currentYear;
                return monthValue === currentMonth && yearValue === currentYear;
              }
            );

            if (!detailFeeForCurrentMonth || !detailFeeForCurrentMonth.paid) {
              // Fee is due, send reminder
              const singleClass = await Classes.findById({
                _id: oneFeeDetail.classId,
              });
              const classTitle = singleClass?.classTitle || "your class";
              const periodLabel = formatFeePeriodLabel(currentMonth, currentYear);
              const messageMain = `Reminder: Your fee of ${classTitle} is due for ${periodLabel}. Please pay as soon as possible.`;

              try {
                const exists = await Notification.exists({
                  userId: student._id,
                  type: "PAYMENT_DUE",
                  classId: oneFeeDetail.classId,
                  feeMonth: currentMonth,
                  feeYear: currentYear,
                  createdAt: { $gte: todayStart },
                });
                if (!exists) {
                  await Notification.create({
                    userId: student._id,
                    role: "student",
                    type: "PAYMENT_DUE",
                    title: `Payment due for ${classTitle}`,
                    message: messageMain,
                    classId: oneFeeDetail.classId,
                    feeMonth: currentMonth,
                    feeYear: currentYear,
                    payload: {
                      classTitle,
                      feeMonth: currentMonth,
                      feeYear: currentYear,
                      totalFee: oneFeeDetail.totalFee,
                    },
                  });
                }
              } catch (notifyError) {
                console.error("Failed to create payment due notification:", notifyError);
              }
              //
              // res.status(200).json(message)
              // break; // Stop checking other fees for this student
            }
          } else {
            console.log(
              "detailFee array is not defined or is not an array for this fee:",
              oneFeeDetail
            );
          }
        }
      }
    } catch (error) {
      console.log("Something went wrong!!!", error);
    }
    },
    {
      timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata",
    }
  );
};

export default feeReminderScheduler;
