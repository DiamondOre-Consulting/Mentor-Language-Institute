import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { IoClose } from "react-icons/io5";
import { getToastVariant } from "../../utils/toastVariant";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherEditStudent = ({ studentData, closingModel }) => {
  // console.log("close model",closeModel)
  const navigate = useNavigate();
  const { id } = useParams();
  const { get, put } = useApi();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setdob] = useState("");
  const [grade, setGrade] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedStudent, setResolvedStudent] = useState(null);
  const toastVariant = getToastVariant(popupMessage);

  const effectiveStudent = studentData || resolvedStudent;

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (studentData) {
      setResolvedStudent(studentData);
    }
  }, [studentData]);

  useEffect(() => {
    if (effectiveStudent) {
      setName(effectiveStudent.name || "");
      setPhone(effectiveStudent.phone || "");
      setUserName(effectiveStudent.userName || "");
      setEmail(effectiveStudent.email || "");
      setdob(effectiveStudent.dob || "");
      setPassword("");
      setGrade(effectiveStudent?.grade || "");
    }
  }, [effectiveStudent]);

  useEffect(() => {
    const fetchStudent = async () => {
      if (studentData || !id) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        setLoading(true);
        const response = await get({
          url: `/teachers/student/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setResolvedStudent(response.data);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, studentData, navigate, get]);

  const handleStudentEdit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      if (!effectiveStudent?._id) {
        setPopupMessage("Student data not available.");
        return;
      }
      const response = await put({
        url: `/teachers/student-edit/${effectiveStudent?._id}`,
        data: {
          name,
          phone,
          password,
          userName,
          email,
          grade,
          dob,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Edited Successfully");
        setName("");
        setPhone("");
        setPassword("");
        setUserName("");
      } else if (response.status === 400) {
        setPopupMessage(response.data.message);
      } else {
        setPopupMessage("Error Editing Student");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setPopupMessage(error.response.data.message);
        } else {
          setPopupMessage("Error Editing Student");
        }
      } else {
        setPopupMessage("Error Editing Student");
      }
    } finally {
      setLoading(false);
      if (closingModel) {
        closingModel();
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <>
      <section className="relative mt-10 md:-mt-12">
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
        <div className="flex flex-col items-center justify-center mt-16 lg:py-0 px-4">
          <div className="w-full bg-white border-t-4 border-orange-400 rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                  Edit Form
                </h1>
                <IoClose
                  onClick={closingModel}
                  className="text-2xl cursor-pointer"
                />
              </div>

              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleStudentEdit}
              >
                <div>
                  <input
                    type="text"
                    name="userName"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Please Enter a unique userName"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="grade"
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter Grade"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>
                <div>
                  <input
                    type="phone"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div className="flex items-center justify-between w-full p-2 border border-gray-500 rounded-md">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 "
                    htmlFor="dob"
                  >
                    {effectiveStudent?.dob?.split("T")[0]}
                  </label>
                  <input
                    type="date"
                    id="dob"
                    value={dob}
                    className="h-8 rounded-lg outline-none focus:ring-0"
                    onChange={(e) => setdob(e.target.value)} // Capture the date input
                    placeholder="Data of Birth"
                  />
                </div>
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter New Password"
                    className="bg-gray-50 border border-gray-900 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5      "
                  />
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

                <div className="w-full">
                  <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                    Edit
                  </button>
                </div>
              </form>
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
          </div>
        </div>
      </section>
    </>
  );
};

export default TeacherEditStudent;

