import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { getToastVariant } from "../../utils/toastVariant";
import {
  normalizeDigits,
  validateAmountPaid,
  validateEmail,
  validateNumber,
  validatePhone,
  validateRequired,
} from "../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Register = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const { get, post, put } = useApi();
  const [courseErrors, setCourseErrors] = useState({});
  const [teacherErrors, setTeacherErrors] = useState({});
  const [studentErrors, setStudentErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  const handleTabClick = (index) => {
    setActiveTab(index);
  };
  // admin
  const [formValues, setFormValues] = useState({
    classTitle: "",
    // classSchedule: "",
    totalHours: "",
    grade: "",
  });

  // const [selectedDays, setSelectedDays] = useState({
  //     Mon: false,
  //     Tue: false,
  //     Wed: false,
  //     Thu: false,
  //     Fri: false,
  //     Sat: false,
  //     Sun: false,
  // });

  // const handleCheckboxChange = (event) => {
  //     const { name, checked } = event.target;
  //     setSelectedDays({ ...selectedDays, [name]: checked });
  // };

  const navigate = useNavigate();

  const handleAddCourse = async (e) => {
    setLoading(true);
    e.preventDefault();
    const nextErrors = {
      classTitle: validateRequired(formValues.classTitle, "Class title"),
      totalHours: validateNumber(formValues.totalHours, {
        min: 1,
        label: "Total hours",
      }),
      grade: validateRequired(formValues.grade, "Grade"),
    };
    setCourseErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      // let classScheduleString = '';

      // Object.entries(selectedDays).forEach(([day, isChecked]) => {
      //     if (isChecked) {
      //         classScheduleString += day.substring(0, 3) + ' ';
      //     }
      // });

      const formData = {
        classTitle: formValues.classTitle,
        totalHours: formValues.totalHours,
        grade: formValues.grade,
        // classSchedule: classScheduleString.trim(), // Ensure the schedule is trimmed
      };

      const response = await post({
        url: "/admin-confi/add-new-class",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        // console.log("New course has been added");
        setPopupMessage("New Course Has Been Added");
        setFormValues({
          classTitle: "",
          totalHours: "",
          grade: "",
        });
        // setSelectedDays({
        //     Mon: false,
        //     Tue: false,
        //     Wed: false,
        //     Thu: false,
        //     Fri: false,
        //     Sat: false,
        //     Sun: false,
        // });
      } else if (response.status === 404) {
        // console.log("Admin not found");
        setPopupMessage("Admin not found");
      } else {
        // console.log("Error adding course:", response.status);
        setPopupMessage("Error adding course");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          setPopupMessage("Admin not found");
        } else {
          console.error("Error adding course:", status);
          setPopupMessage("Error adding course");
        }
      } else {
        console.error("Error adding course:", error.message);
        setPopupMessage("Error adding course");
      }
    } finally {
      setLoading(false);
    }
  };

  //teacher

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setdob] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const [studentPayment, setStudentPayment] = useState({
    totalFee: "",
    paid: "pending",
    amountPaid: "0",
  });
  const toastVariant = getToastVariant(popupMessage);

  const normalizeGradeValue = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim().toLowerCase();
    if (!str) return "";
    const match = str.match(/\d+/);
    if (!match) return str;
    const num = parseInt(match[0], 10);
    if (!Number.isFinite(num)) return "";
    return String(num);
  };

  const toGradeLabel = (value) => {
    const normalized = normalizeGradeValue(value);
    if (!normalized) return "";
    const num = Number(normalized);
    if (!Number.isFinite(num)) {
      return String(value).trim();
    }
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  const deriveGradeFromText = (text) => {
    if (!text) return "";
    const str = String(text).toLowerCase();
    const match = str.match(/\b(6|7|8|9|10|11|12)(?:st|nd|rd|th)?\b/);
    if (!match) return "";
    return toGradeLabel(match[1]);
  };

  const resolveCourseGradeLabel = (course) =>
    toGradeLabel(course?.grade) || deriveGradeFromText(course?.classTitle);

  const filteredCourses = useMemo(() => {
    if (!grade.trim()) return allCourses;
    const gradeValue = normalizeGradeValue(grade);
    return allCourses.filter(
      (course) =>
        normalizeGradeValue(resolveCourseGradeLabel(course)) === gradeValue
    );
  }, [allCourses, grade]);

  const updateCourseField = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (field === "classTitle") {
      setCourseErrors((prev) => ({
        ...prev,
        classTitle: validateRequired(value, "Class title"),
      }));
    }
    if (field === "totalHours") {
      setCourseErrors((prev) => ({
        ...prev,
        totalHours: validateNumber(value, { min: 1, label: "Total hours" }),
      }));
    }
    if (field === "grade") {
      setCourseErrors((prev) => ({
        ...prev,
        grade: validateRequired(value, "Grade"),
      }));
    }
  };

  const updateTeacherField = (field, value) => {
    if (field === "name") {
      setName(value);
      setTeacherErrors((prev) => ({
        ...prev,
        name: validateRequired(value, "Name"),
      }));
      return;
    }
    if (field === "phone") {
      const next = normalizeDigits(value).slice(0, 10);
      setPhone(next);
      setTeacherErrors((prev) => ({
        ...prev,
        phone: validatePhone(next),
      }));
      return;
    }
    if (field === "password") {
      setPassword(value);
      setTeacherErrors((prev) => ({
        ...prev,
        password: validateRequired(value, "Password"),
      }));
      return;
    }
    if (field === "dob") {
      setdob(value);
      setTeacherErrors((prev) => ({
        ...prev,
        dob: validateRequired(value, "Date of birth"),
      }));
      return;
    }
    if (field === "email") {
      setTeacherEmail(value);
      setTeacherErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    }
  };

  const updateStudentField = (field, value) => {
    if (field === "userName") {
      setUserName(value);
      setStudentErrors((prev) => ({
        ...prev,
        userName: validateRequired(value, "Username"),
      }));
      return;
    }
    if (field === "name") {
      setName(value);
      setStudentErrors((prev) => ({
        ...prev,
        name: validateRequired(value, "Name"),
      }));
      return;
    }
    if (field === "phone") {
      const next = normalizeDigits(value).slice(0, 10);
      setPhone(next);
      setStudentErrors((prev) => ({
        ...prev,
        phone: validatePhone(next),
      }));
      return;
    }
    if (field === "email") {
      setEmail(value);
      setStudentErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
      return;
    }
    if (field === "grade") {
      setGrade(value);
      setStudentErrors((prev) => ({
        ...prev,
        grade: validateRequired(value, "Grade"),
      }));
      return;
    }
    if (field === "dob") {
      setdob(value);
      setStudentErrors((prev) => ({
        ...prev,
        dob: validateRequired(value, "Date of birth"),
      }));
      return;
    }
    if (field === "password") {
      setPassword(value);
      setStudentErrors((prev) => ({
        ...prev,
        password: validateRequired(value, "Password"),
      }));
    }
  };

  const handleteacherRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);
    const nextErrors = {
      name: validateRequired(name, "Name"),
      phone: validatePhone(phone),
      email: validateEmail(teacherEmail),
      password: validateRequired(password, "Password"),
      dob: validateRequired(dob, "Date of birth"),
    };
    setTeacherErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      if (!name || !phone || !password || !dob || !teacherEmail) {
        setPopupMessage("All field are required");
        return;
      }

      const payload = {
        name,
        phone,
        email: teacherEmail,
        password,
        dob,
      };

      const response = await post({
        url: "/admin-confi/add-teacher",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Teacher registered successfully");
        setName("");
        setPhone("");
        setPassword("");
        setdob("");
        setTeacherEmail("");
      } else if (response.status === 409) {
        setPopupMessage("Teacher already registered");
      } else {
        setPopupMessage("Error registering teacher");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("Teacher already registered");
        } else {
          setPopupMessage("Error registering teacher");
        }
      } else {
        setPopupMessage("Error registering teacher");
      }
    } finally {
      setLoading(false);
    }
  };

  // register students

  const handleStudentRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);
    const nextErrors = {
      userName: validateRequired(userName, "Username"),
      name: validateRequired(name, "Name"),
      phone: validatePhone(phone),
      email: validateEmail(email),
      grade: validateRequired(grade, "Grade"),
      dob: validateRequired(dob, "Date of birth"),
      password: validateRequired(password, "Password"),
    };
    setStudentErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }
    const paymentNextErrors = courseId
      ? {
          totalFee: validateNumber(studentPayment.totalFee, {
            min: 0,
            label: "Total fee",
          }),
          amountPaid:
            studentPayment.paid === "yes"
              ? validateAmountPaid(studentPayment.amountPaid, studentPayment.totalFee, {
                  required: true,
                })
              : "",
        }
      : {};
    setPaymentErrors(paymentNextErrors);
    if (Object.values(paymentNextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        setLoading(false);
        return;
      }
      if (!name || !phone || !password || !dob || !userName || !email) {
        setPopupMessage("All field are required");
        setLoading(false);
        return;
      }

      if (courseId) {
        if (
          !studentPayment.totalFee
        ) {
          setPopupMessage("Please enter fee amount for enrollment.");
          setLoading(false);
          return;
        }
        if (
          studentPayment.paid === "yes" &&
          (!studentPayment.amountPaid ||
            Number(studentPayment.amountPaid) <= 0)
        ) {
          setPopupMessage("Amount paid is required when payment is marked yes.");
          setLoading(false);
          return;
        }
      }

      const response = await post({
        url: "/admin-confi/add-student",
        data: {
          name,
          phone,
          password,
          userName,
          email,
          dob,
          grade,
          courseId: courseId || "",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        const newStudentId = response?.data?.studentId;
        if (courseId && newStudentId) {
          const normalizedAmountPaid =
            studentPayment.paid === "yes"
              ? Number(studentPayment.amountPaid)
              : 0;
          const totalFeeValue = Number(studentPayment.totalFee);
          const effectivePaid =
            studentPayment.paid === "yes" &&
            totalFeeValue > 0 &&
            normalizedAmountPaid >= totalFeeValue;
          const paymentStatus = effectivePaid
            ? "paid"
            : normalizedAmountPaid > 0
              ? "partial"
              : "pending";

          try {
            const enrollResponse = await put({
              url: `/admin-confi/enroll-student/${courseId}/${newStudentId}`,
              data: {
                totalFee: totalFeeValue,
                paid: studentPayment.paid,
                amountPaid: normalizedAmountPaid,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).unwrap();

            if (enrollResponse.status === 200) {
              if (paymentStatus === "paid") {
                setPopupMessage("Student registered and enrolled. Invoice sent.");
              } else if (paymentStatus === "partial") {
                setPopupMessage("Student registered and enrolled. Partial payment recorded.");
              } else {
                setPopupMessage("Student registered and enrolled.");
              }
            } else {
              setPopupMessage("Student registered, but enrollment failed.");
            }
          } catch (enrollError) {
            const enrollMessage =
              enrollError?.response?.data?.message ||
              "Student registered, but enrollment failed.";
            setPopupMessage(enrollMessage);
          }
        } else {
          setPopupMessage("Student Registered Successfully");
        }
        setName("");
        setPhone("");
        setPassword("");
        setUserName("");
        setEmail("");
        setdob("");
        setGrade("");
        setCourseId("");
        setStudentPayment({
          totalFee: "",
          paid: "pending",
          amountPaid: "0",
        });
      } else if (response.status === 409) {
        setPopupMessage(response?.data?.message || "Student Already Registered");
      } else {
        setPopupMessage("Error Registering Student");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409 || status === 400) {
          setPopupMessage(
            error.response?.data?.message || "Student Already Registered"
          );
        } else {
          setPopupMessage("Error Registering Student");
        }
      } else {
        setPopupMessage("Error Registering Student");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPaymentChange = (e) => {
    const { name, value } = e.target;
    setStudentPayment((prev) => {
      const next = { ...prev, [name]: value };
      const nextErrors = {
        totalFee: validateNumber(next.totalFee, { min: 0, label: "Total fee" }),
        amountPaid:
          next.paid === "yes"
            ? validateAmountPaid(next.amountPaid, next.totalFee, { required: true })
            : "",
      };
      setPaymentErrors(nextErrors);
      return next;
    });
  };

  const handleStudentPaidChange = (value) => {
    setStudentPayment((prev) => {
      const next = {
        ...prev,
        paid: value,
        amountPaid: value === "pending" ? "0" : prev.amountPaid,
      };
      const nextErrors = {
        totalFee: validateNumber(next.totalFee, { min: 0, label: "Total fee" }),
        amountPaid:
          next.paid === "yes"
            ? validateAmountPaid(next.amountPaid, next.totalFee, { required: true })
            : "",
      };
      setPaymentErrors(nextErrors);
      return next;
    });
  };

  const fetchAllcourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: "/admin-confi/all-classes",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status == 200) {

        setAllCourses(response?.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllcourses();
  }, []);

  useEffect(() => {
    if (!courseId) return;
    const stillValid = filteredCourses.some((course) => course?._id === courseId);
    if (!stillValid) {
      setCourseId("");
      setPaymentErrors({});
    }
  }, [courseId, filteredCourses]);

  return (
    <div className="">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <ClipLoader
            color={"#FFA500"}
            loading={loading}
            css={override}
            size={70}
          />
        </div>
      )}
      <div className="flex flex-col items-center w-full">
        <div className="sticky top-[-1px] z-20 w-full bg-white/90 backdrop-blur-md border-b border-orange-100 py-2 flex justify-center shadow-sm">
          <div className="flex space-x-2 md:space-x-4">
            <button
              className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 0 ? "border-orange-500" : "border-transparent"
                } focus:outline-none`}
              onClick={() => handleTabClick(0)}
            >
              Register Student
            </button>
            <button
              className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 1 ? "border-orange-500" : "border-transparent"
                } focus:outline-none`}
              onClick={() => handleTabClick(1)}
            >
              Register Teacher
            </button>
            <button
              className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 2 ? "border-orange-500" : "border-transparent"
                } focus:outline-none`}
              onClick={() => {
                handleTabClick(2);
              }}
            >
              Add New Courses
            </button>
          </div>
        </div>
        <div className="w-full">
          {activeTab === 0 && (
            <section className="w-full">
              <div className="flex flex-col items-center w-full px-6 py-2">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Register Student
                    </h1>
                    <div className=" md:w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      onSubmit={handleStudentRegister}
                    >
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Username
                        </label>
                        <input
                          type="text"
                          name="userName"
                          id="userName"
                          value={userName}
                            onChange={(e) => updateStudentField("userName", e.target.value)}
                          placeholder="Please Enter a unique userName"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                            required=""
                          />
                          {studentErrors.userName && (
                            <p className="mt-1 text-xs text-rose-600">
                              {studentErrors.userName}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => updateStudentField("name", e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          placeholder="Enter Student Name"
                          required=""
                        />
                        {studentErrors.name && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Grade
                        </label>
                        <input
                          type="text"
                          name="grade"
                          value={grade}
                          onChange={(e) => updateStudentField("grade", e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          placeholder="Enter Grade"
                          required=""
                        />
                        {studentErrors.grade && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.grade}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => updateStudentField("email", e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          placeholder="Enter email address"
                          required=""
                        />
                        {studentErrors.email && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={phone}
                          onChange={(e) => updateStudentField("phone", e.target.value)}
                          placeholder="Enter Phone No"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                          inputMode="numeric"
                          maxLength={10}
                        />
                        {studentErrors.phone && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900 "
                          htmlFor="dob"
                        >
                          Date of Birth:
                        </label>
                        <input
                          type="date"
                          id="dob"
                          value={dob}
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 rounded-lg outline-none  focus:ring-0"
                          onChange={(e) => updateStudentField("dob", e.target.value)} // Capture the date input
                          required
                        />
                        {studentErrors.dob && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.dob}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Select Course
                        </label>
                        <select
                          value={courseId}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCourseId(value);
                            if (!value) {
                              setPaymentErrors({});
                            }
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        >
                          <option value="">-- No Course --</option>
                          {filteredCourses?.map((course) => (
                            <option key={course?._id} value={course?._id}>
                              {course?.classTitle}
                            </option>
                          ))}
                        </select>
                        {grade.trim() && filteredCourses.length === 0 && (
                          <p className="mt-2 text-xs text-amber-700">
                            No courses available for grade {grade}.
                          </p>
                        )}
                      </div>
                      {courseId && (
                        <>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                              Total Fee
                            </label>
                            <input
                              type="text"
                              name="totalFee"
                              value={studentPayment.totalFee}
                              onChange={handleStudentPaymentChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg w-full p-2.5"
                              placeholder="Enter total fee"
                              required
                              inputMode="decimal"
                            />
                            {paymentErrors.totalFee && (
                              <p className="mt-1 text-xs text-rose-600">
                                {paymentErrors.totalFee}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                              Payment Status
                            </label>
                            <div className="flex items-center gap-4 text-sm text-gray-700">
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="paid"
                                  value="pending"
                                  checked={studentPayment.paid === "pending"}
                                  onChange={() => handleStudentPaidChange("pending")}
                                />
                                <span>Pending</span>
                              </label>
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="paid"
                                  value="yes"
                                  checked={studentPayment.paid === "yes"}
                                  onChange={() => handleStudentPaidChange("yes")}
                                />
                                <span>Yes</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">
                              Amount Paid
                            </label>
                            <input
                              type="text"
                              name="amountPaid"
                              value={studentPayment.amountPaid}
                              onChange={handleStudentPaymentChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg w-full p-2.5"
                              placeholder="Enter amount paid"
                              required={studentPayment.paid === "yes"}
                              disabled={studentPayment.paid === "pending"}
                              inputMode="decimal"
                            />
                            {paymentErrors.amountPaid && (
                              <p className="mt-1 text-xs text-rose-600">
                                {paymentErrors.amountPaid}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => updateStudentField("password", e.target.value)}
                          placeholder="********"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                        {studentErrors.password && (
                          <p className="mt-1 text-xs text-rose-600">
                            {studentErrors.password}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <label
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          Show Password
                        </label>
                      </div>

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 1 && (
            <section className="w-full">
              <div className="flex flex-col items-center w-full px-6 py-2">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Register Teacher
                    </h1>
                    <div className="w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      action="#"
                      onSubmit={handleteacherRegister}
                    >
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => updateTeacherField("name", e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          placeholder="Enter Teacher Name"
                          required=""
                        />
                        {teacherErrors.name && (
                          <p className="mt-1 text-xs text-rose-600">
                            {teacherErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={phone}
                          onChange={(e) => updateTeacherField("phone", e.target.value)}
                          placeholder="Enter Phone No"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                          inputMode="numeric"
                          maxLength={10}
                        />
                        {teacherErrors.phone && (
                          <p className="mt-1 text-xs text-rose-600">
                            {teacherErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900 "
                          htmlFor="dob"
                        >
                          Date of Birth:
                        </label>
                        <input
                          type="date"
                          id="dob"
                          value={dob}
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 rounded-lg outline-none  focus:ring-0"
                          onChange={(e) => updateTeacherField("dob", e.target.value)} // Capture the date input
                          required
                        />
                        {teacherErrors.dob && (
                          <p className="mt-1 text-xs text-rose-600">
                            {teacherErrors.dob}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Email
                        </label>
                        <input
                          type="email"
                          name="teacherEmail"
                          value={teacherEmail}
                          onChange={(e) => updateTeacherField("email", e.target.value)}
                          placeholder="Enter Email"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                        {teacherErrors.email && (
                          <p className="mt-1 text-xs text-rose-600">
                            {teacherErrors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => updateTeacherField("password", e.target.value)}
                          placeholder="********"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                        {teacherErrors.password && (
                          <p className="mt-1 text-xs text-rose-600">
                            {teacherErrors.password}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <label
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          Show Password
                        </label>
                      </div>

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 2 && (
            <section className="w-full">
              <div className="flex flex-col items-center w-full px-6 py-2">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Add New Course
                    </h1>
                    <div className="w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      action="#"
                      onSubmit={handleAddCourse}
                    >
                      <div>
                        <label
                          htmlFor="classTitle"
                          className="block w-full mb-2 text-sm font-medium text-gray-900"
                        >
                          Class Title
                        </label>
                          <input
                            type="text"
                            name="classTitle"
                            onChange={(e) => updateCourseField("classTitle", e.target.value)}
                            value={formValues.classTitle}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      "
                            placeholder="Enter Course Title"
                            required=""
                          />
                          {courseErrors.classTitle && (
                            <p className="mt-1 text-xs text-rose-600">
                              {courseErrors.classTitle}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Grade
                        </label>
                        <select
                          name="grade"
                          value={formValues.grade}
                          onChange={(e) => updateCourseField("grade", e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                          required=""
                        >
                          <option value="">Select Grade</option>
                          <option value="6th">6th</option>
                          <option value="7th">7th</option>
                          <option value="8th">8th</option>
                          <option value="9th">9th</option>
                          <option value="10th">10th</option>
                          <option value="11th">11th</option>
                          <option value="12th">12th</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Total Hours
                        </label>
                        <input
                          type="text"
                          name="totalHours"
                          onChange={(e) => updateCourseField("totalHours", e.target.value)}
                          value={formValues.totalHours}
                          placeholder="Enter Total Hours"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      "
                          required=""
                        />
                        {courseErrors.totalHours && (
                          <p className="mt-1 text-xs text-rose-600">
                            {courseErrors.totalHours}
                          </p>
                        )}
                      </div>
                      {/* <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-900 ">Schedule</label>
                                                <ul className="flex flex-wrap items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex sm:">

                                                    {Object.entries(selectedDays).map(([day, isChecked]) => (
                                                        <li
                                                            key={day}
                                                            className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r "
                                                        >
                                                            <div className="flex items-center ps-3">
                                                                <input
                                                                    id={`${day}-checkbox-list`}
                                                                    type="checkbox"
                                                                    name={day}
                                                                    checked={isChecked}
                                                                    onChange={handleCheckboxChange}
                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500    focus:ring-2  -gray-500"
                                                                />
                                                                <label
                                                                    for={`${day}-checkbox-list`}
                                                                    className="w-full py-3 ms-2 text-sm font-medium text-gray-900 "
                                                                >
                                                                    {day}
                                                                </label>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div> */}

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {popupMessage && (
        <div className="app-toast-overlay">
          <div className={`app-toast-card app-toast-${toastVariant} relative`}>
            <button
              type="button"
              className="app-toast-close"
              onClick={() => setPopupMessage(null)}
              aria-label="Close notification"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="pt-2 text-sm font-semibold">
              {popupMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;




