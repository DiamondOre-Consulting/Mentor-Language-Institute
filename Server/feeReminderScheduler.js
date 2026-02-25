import cron from "node-cron";
import twilio from "twilio";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";
import Fee from "./Models/Fee.js";
import { normalizeFeeMonth } from "./utils/fee.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const defaultCountryCode = process.env.TWILIO_DEFAULT_COUNTRY_CODE || "+91";
const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

const feeReminderScheduler = () => {
  if (!client || !fromNumber) {
    console.warn(
      "Fee reminder scheduler is disabled. Missing Twilio configuration."
    );
    return;
  }

  cron.schedule(
    "0 10 * * *",
    async () => {
      // 10 am IST is 4 am UTC
    try {
      const students = await Students.find({}, { password: 0 });

      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
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
              (detail) => normalizeFeeMonth(detail.feeMonth) === currentMonth
            );

            if (!detailFeeForCurrentMonth || !detailFeeForCurrentMonth.paid) {
              // Fee is due, send reminder
              const singleClass = await Classes.findById({
                _id: oneFeeDetail.classId,
              });
              const phoneNumber = student.phone;
              if (!phoneNumber) {
                continue;
              }
              const classTitle = singleClass?.classTitle || "your class";
              const messageMain = `Reminder: Your fee of ${classTitle} is due for this month. Please pay as soon as possible.`;
              //
              // res.status(200).json(message)
              client.messages
                .create({
                  body: messageMain,
                  from: fromNumber,
                  to: `${defaultCountryCode}${phoneNumber}`,
                })
                .then((message) => console.log(message.sid))
                .catch((error) => console.error("Error sending SMS:", error));
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
