import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { validateAmountPaid, validateNumber } from "../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const EachStu = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [classes, setAllClasses] = useState([]);
  const { get, put } = useApi();
  const [studentsDetails, setStudentsDetails] = useState(null);
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [attendenceDetails, setAttendenceDetails] = useState(null);
  const [feedetails, setFeeDetails] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [amount, setAmount] = useState("");
  const [paidStatus, setPaidStatus] = useState("pending");
  const [totalFee, setTotalFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [feeErrors, setFeeErrors] = useState({});
  const paymentPeriodLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        // Fetch student details
        const studentResponse = await get({
          url: `/admin-confi/all-students/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (studentResponse.status === 200) {
          // Set student details
          setStudentsDetails(studentResponse.data);

          // Fetch classes associated with the student
          const classIds = studentResponse.data.classes || [];
          const classResponses = await Promise.allSettled(
            classIds.map((classId) =>
              get({
                url: `/admin-confi/all-classes/${classId}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).unwrap()
            )
          );

          const classesData = classResponses
            .filter(
              (result) =>
                result.status === "fulfilled" &&
                result.value.status === 200 &&
                result.value.data
            )
            .map((result) => result.value.data);

          const classesWithTeacher = classesData.map((course) => {
            const primaryTeacher = course?.teachers?.[0]?.teacherId || null;
            return { ...course, teacher: primaryTeacher };
          });

          setAllClasses(classesWithTeacher);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, token]);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCourseSelection = (event) => {
    setSelectedCourseId(event.target.value);
  };


  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      setLoading(true);
      try {
        if (selectedCourseId) {
          const attendanceResponse = await get({
            url: `/admin-confi/attendance/${selectedCourseId}/${id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();
          if (attendanceResponse.status === 200) {
            // console.log("Attendance details:", attendanceResponse.data);
            setAttendenceDetails(attendanceResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchAttendanceDetails();
  }, [selectedCourseId, id, token]);

  // getfee

  const numberToMonthName = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const normalizeMonthLabel = (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return "";
      }
      const numeric = Number(trimmed);
      if (Number.isInteger(numeric)) {
        return numberToMonthName[numeric] || "";
      }
      return trimmed;
    }
    if (Number.isInteger(value)) {
      return numberToMonthName[value] || "";
    }
    return "";
  };

  const buildFeeDetails = (feeData) => {
    if (!feeData) return null;
    const currentMonth = new Date().getMonth() + 1;
    const currentYearValue = new Date().getFullYear();
    const totalFeeValue = Number(feeData?.totalFee || 0);
    const rawDetails = Array.isArray(feeData?.detailFee) ? feeData.detailFee : [];
    const hasCurrentMonth = rawDetails.some((fee) => {
      const monthValue = Number(fee?.feeMonth);
      const yearValue = Number(fee?.feeYear) || currentYearValue;
      return monthValue === currentMonth && yearValue === currentYearValue;
    });

    const normalizedDetails = rawDetails.map((fee) => ({
      ...fee,
      __monthNumber: Number(fee?.feeMonth),
      __yearNumber: Number(fee?.feeYear) || currentYearValue,
      feeYear: Number(fee?.feeYear) || currentYearValue,
      feeMonth: `${normalizeMonthLabel(fee?.feeMonth)} ${Number(fee?.feeYear) || currentYearValue}`,
      amountPaid: Number(fee?.amountPaid || 0),
    }));

    if (totalFeeValue > 0 && !hasCurrentMonth) {
      normalizedDetails.push({
        feeMonth: `${normalizeMonthLabel(currentMonth)} ${currentYearValue}`,
        __monthNumber: currentMonth,
        __yearNumber: currentYearValue,
        feeYear: currentYearValue,
        amountPaid: 0,
        paid: false,
        _virtual: true,
      });
    }

    normalizedDetails.sort(
      (a, b) => {
        if (Number(a.__yearNumber || 0) !== Number(b.__yearNumber || 0)) {
          return Number(a.__yearNumber || 0) - Number(b.__yearNumber || 0);
        }
        return Number(a.__monthNumber || 0) - Number(b.__monthNumber || 0);
      }
    );

    return {
      ...feeData,
      detailFee: normalizedDetails,
    };
  };

  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        if (selectedCourseId) {
          const FeeResponse = await get({
            url: `/admin-confi/fee/${selectedCourseId}/${id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();

          if (FeeResponse.status === 200) {
            setTotalFee(FeeResponse.data.totalFee);
            setFeeDetails(buildFeeDetails(FeeResponse.data));
          }
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchFeeDetails();
  }, [selectedCourseId, id, token]);

  // fee update

  const handleFeeUpdate = async () => {
    try {
      if (!paidStatus) {
        alert("Please fill in all fields.");
        return;
      }
      const isPaid = paidStatus === "yes";
      const normalizedAmount = isPaid ? Number(amount) : 0;
      const effectivePaid =
        isPaid && Number(totalFee) > 0 && normalizedAmount >= Number(totalFee);
      const nextErrors = {
        amountPaid: isPaid
          ? validateAmountPaid(amount, totalFee, { required: true })
          : "",
        totalFee: validateNumber(totalFee, { min: 0, label: "Total fee" }),
      };
      setFeeErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        return;
      }
      if (isPaid && (!amount || Number.isNaN(normalizedAmount) || normalizedAmount <= 0)) {
        alert("Please enter a valid amount.");
        return;
      }

      const now = new Date();
      const monthNumber = now.getMonth() + 1;
      const yearValue = now.getFullYear();
      const monthLabel = now.toLocaleDateString("en-US", { month: "long" });

      const response = await put({
        url: `/admin-confi/update-fee/${selectedCourseId}/${id}`,
        data: {
          feeMonth: monthNumber,
          feeYear: yearValue,
          paid: isPaid,
          amountPaid: normalizedAmount,
          totalFee: totalFee,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response?.status === 200) {
        // console.log("Fee updated successfully");
        const updatedFeeDetails = [...(feedetails?.detailFee || [])];
        const existingIndex = updatedFeeDetails.findIndex(
          (fee) =>
            Number(fee.__monthNumber) === Number(monthNumber) &&
            Number(fee.__yearNumber) === Number(yearValue)
        );
        const entry = {
          ...(existingIndex >= 0 ? updatedFeeDetails[existingIndex] : {}),
          feeMonth: `${monthLabel} ${yearValue}`,
          feeYear: yearValue,
          __monthNumber: monthNumber,
          __yearNumber: yearValue,
          amountPaid: normalizedAmount,
          paid: effectivePaid,
        };
        if (existingIndex >= 0) {
          updatedFeeDetails[existingIndex] = entry;
        } else {
          updatedFeeDetails.push(entry);
        }
        setFeeDetails({ ...feedetails, detailFee: updatedFeeDetails });
        setAmount("");
        setPaidStatus("pending");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };


  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader
            color={"#FFA500"}
            loading={loading}
            css={override}
            size={70}
          />
        </div>
      )}
      <div className="px-4 sm:px-1 lg:px-8">
        <h1 className=" text-3xl font-semibold  tracking-tight text-gray-900">
          {studentsDetails?.name}
        </h1>
        <p className="text-gray-500">{studentsDetails?.phone}</p>
      </div>
      <main className="overflow-x-hidden">
        <div className="mt-4 md:mt-32 md:max-w-7xl py-0 ">
          <div className="flex flex-wrap  md:-mx-2  ">
            <div className="w-full mx-2 md:block lg:block md:-mt-24 sm:mt-0">
              <div className="block lg:block overflow-scroll md:overflow-hidden">
                <ul className="flex bg-white ">
                  <li className=" mr-1">
                    <a
                      className="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-orange-500 font-semibold shadow-md cursor-pointer"
                      onClick={() => handleTabClick("personal")}
                    >
                      Personal Information
                    </a>
                  </li>
                  <li className="mr-1">
                    <a
                      className="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("EnrolledCourses")}
                    >
                      Enrolled Courses
                    </a>
                  </li>
                  <li className="mr-1">
                    <a
                      className="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("FeeDetails")}
                    >
                      Fee Details
                    </a>
                  </li>
                  <li className="mr-1">
                    <a
                      className="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("AttendanceDetails")}
                    >
                      Attendance Details
                    </a>
                  </li>
                </ul>
              </div>
              {activeTab === "personal" && (
                <div className="w-full mt-8 flex flex-col 2xl:w-1/3">
                  <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
                    <ul className="mt-2 text-gray-700">
                      <li className="flex border-y py-2">
                        <span className="font-bold w-24">Full name:</span>
                        <span className="text-gray-700">
                          {studentsDetails?.name}
                        </span>
                      </li>
                      <li className="flex border-b py-2">
                        <span className="font-bold w-24">phone:</span>
                        <span className="text-gray-700">
                          {studentsDetails?.phone}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "EnrolledCourses" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 bg-white pt-10 ">
                  {classes.length === 0 ? (
                    <div>No classes are there</div>
                  ) : (
                    classes.map((course) => (
                      <a
                        key={course?._id || course?.classTitle}
                        className="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
                      >
                        <h5 className="mb-2 text-md md:text-xl font-bold tracking-tight text-gray-900 ">
                          {course?.classTitle}
                        </h5>
                        {/* <p className="font-normal text-sm text-gray-700 ">classSchedule:- <span>{course?.classSchedule}</span></p> */}
                        <p className="font-normal text-sm text-gray-700 ">
                          Duration :- <span>{course?.totalHours}</span>
                        </p>
                        <p className="font-normal text-sm text-gray-700 ">
                          Teach By :-{" "}
                          <span>
                            {course?.teacher ? course.teacher.name : "Unknown"}
                          </span>
                        </p>
                      </a>
                    ))
                  )}
                </div>
              )}

              {activeTab === "FeeDetails" && (
                <div className="max-w-full overflow-hidden bg-white pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 sm:w-72"
                    onChange={handleCourseSelection}
                    value={selectedCourseId || ""}
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {classes.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.classTitle}
                      </option>
                    ))}
                  </select>
                    <span className="inline-flex w-fit rounded-md bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                      Total Fee: {totalFee || 0}
                    </span>
                  </div>
                  <div>
                    <div className="relative mt-6 max-w-full overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-[640px] w-full text-sm text-left text-gray-500">
                        <thead className="bg-slate-100 text-xs uppercase text-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Month
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {feedetails &&
                            feedetails?.detailFee?.map((fee) => (
                              <tr
                                key={fee?._id || fee?.feeMonth}
                                className="border-b bg-white"
                              >
                                <th
                                  scope="row"
                                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                >
                                  {fee.feeMonth}
                                </th>

                                <th
                                  scope="row"
                                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                >
                                  {fee.amountPaid.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                  })}
                                </th>

                                {(() => {
                                  const paidSoFar = Number(fee.amountPaid || 0);
                                  const total = Number(totalFee || 0);
                                  return (
                                    <td className="px-6 py-4">
                                      {total <= 0 ? (
                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                                          Pending
                                        </span>
                                      ) : paidSoFar >= total ? (
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                          Paid ✓
                                        </span>
                                      ) : paidSoFar > 0 ? (
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                            Partial ✓ Paid {paidSoFar}
                                          </span>
                                          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
                                            Pending {Math.max(0, total - paidSoFar)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                                          Pending {total}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })()}
                              </tr>
                            ))}

                          <tr className="bg-white border-b  ">
                              <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="text-sm font-semibold text-slate-700">
                                  {paymentPeriodLabel}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  Payment period is recorded automatically.
                                </p>
                              </td>

                              <td className="px-6 py-4 font-medium text-gray-900">
                                <input
                                  type="text"
                                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 sm:w-auto"
                                  placeholder="Amount paid"
                                  value={amount}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setAmount(value);
                                    setFeeErrors((prev) => ({
                                      ...prev,
                                      amountPaid:
                                        paidStatus === "yes"
                                          ? validateAmountPaid(value, totalFee, { required: true })
                                          : "",
                                    }));
                                  }}
                                  disabled={paidStatus === "pending"}
                                  inputMode="decimal"
                                ></input>
                                {feeErrors.amountPaid && (
                                  <p className="mt-1 text-xs text-rose-600">
                                    {feeErrors.amountPaid}
                                  </p>
                                )}
                              </td>

                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                      <input
                                        type="radio"
                                        name="paidStatus"
                                        value="pending"
                                        checked={paidStatus === "pending"}
                                        onChange={() => {
                                          setPaidStatus("pending");
                                          setFeeErrors((prev) => ({ ...prev, amountPaid: "" }));
                                        }}
                                      />
                                      Pending
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                      <input
                                        type="radio"
                                        name="paidStatus"
                                        value="yes"
                                        checked={paidStatus === "yes"}
                                        onChange={() => {
                                          setPaidStatus("yes");
                                          setFeeErrors((prev) => ({
                                            ...prev,
                                            amountPaid: validateAmountPaid(amount, totalFee, {
                                              required: true,
                                            }),
                                          }));
                                        }}
                                      />
                                      Yes
                                    </label>
                                </div>
                                <button
                                  className="rounded-md bg-green-600 px-4 py-2 text-gray-200"
                                  onClick={handleFeeUpdate}
                                >
                                  Update Fee
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {
                // person will select course the month the date come when the enrolld and thart month make the logic if sunday hai to write sunday
                activeTab === "AttendanceDetails" && (
                  <div className="bg-white pt-10">
                    <div className="flex ">
                      <select onChange={handleCourseSelection}>
                        <option value="">Select Course</option>
                        {classes.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.classTitle}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="relative overflow-x-auto mt-8">
                        <table className="w-full text-sm text-center rtl:text-center text-gray-500 ">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50  ">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Number Of Classes Taken
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendenceDetails &&
                              attendenceDetails.detailAttendance.map(
                                (attendance) => (
                                  <tr
                                    key={attendance?._id || attendance?.classDate}
                                    className="bg-white border-b  "
                                  >
                                    <th
                                      scope="row"
                                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                    >
                                      {attendance.classDate}
                                    </th>
                                    <td className={`px-6 py-4`}>
                                      {attendance.numberOfClassesTaken}
                                    </td>
                                  </tr>
                                )
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              }

              <div className="my-1 "></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EachStu;


