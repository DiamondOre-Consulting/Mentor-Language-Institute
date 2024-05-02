import cron from "node-cron";
import twilio from "twilio";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";
import Fee from "./Models/Fee.js";

const accountSid = "ACb5f88acc0551052e9301d3334b6dffc8";
const authToken = "5f266d8cfdab46c27bc43ce71256f1ff";
// const client = require('twilio')(accountSid, authToken);
const client = twilio(accountSid, authToken);

const feeReminderScheduler = () => {
  cron.schedule("18 13 1 * *", async () => {
    // 10 am IST is 4 am UTC
    try {
      console.log("Scheduled task started.");
      const students = await Students.find({}, { password: 0 });

      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
      // const currentYear = new Date().getFullYear(); // Get current year

      for (const student of students) {
        for (const fee of student.feeDetail) {
          console.log(fee);
          const oneFeeDetail = await Fee.findById({ _id: fee });
          if (oneFeeDetail.detailFee && Array.isArray(oneFeeDetail.detailFee)) {
            const detailFeeForCurrentMonth = oneFeeDetail.detailFee.find(
              (detail) => {
                const feeMonth = detail.feeMonth;
                return feeMonth === currentMonth;
              }
            );

            if (!detailFeeForCurrentMonth || !detailFeeForCurrentMonth.paid) {
              // Fee is due, send reminder
              const singleClass = await Classes.findById({
                _id: oneFeeDetail.classId,
              });
              const phoneNumber = student.phone;
              const messageMain = `Reminder: Your fee of ${singleClass.classTitle} is due for this month. Please pay as soon as possible.`;
              //
              // res.status(200).json(message)
              client.messages
                .create({
                  body: messageMain,
                  from: "+13343848072",
                  to: `+91${phoneNumber}`,
                })
                .then((message) => console.log(message.sid))
                .catch((error) => console.error("Error sending SMS:", error));
              console.log("Will start sms service!!!");
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
  });
};

export default feeReminderScheduler;
