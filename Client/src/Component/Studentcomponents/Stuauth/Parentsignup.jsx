import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useApi } from "../../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { getToastVariant } from "../../../utils/toastVariant";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Parentlog = () => {
  const navigate = useNavigate();
  const { post } = useApi();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setdob] = useState();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const gradeOptions = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const toastVariant = getToastVariant(popupMessage);

  const handleStudentRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      const response = await post({
        url: "/students/signup",
        data: {
          name,
          phone,
          password,
          userName,
          dob,
          email,
          grade,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Registered Successfully");
        setName("");
        setPhone("");
        setPassword("");
        setEmail("");
        navigate("/student-login");
      } else if (response.status === 409) {
        setPopupMessage("Username, phone, or email already exists.");
      } else {
        setPopupMessage("Error Registering Student");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409 || status === 400) {
          setPopupMessage(
            error.response?.data?.message || "Student already registered."
          );
        } else {
          console.error("Error adding Student:", status);
          setPopupMessage("Error Registering Student");
        }
      } else {
        console.error("Error adding student:", error.message);
        setPopupMessage("Error Registering Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="relative mt-10 md:-mt-12">
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
        <div className="flex flex-col items-center justify-center mt-16 lg:py-0 px-4">
          <div className="w-full bg-white rounded-lg shadow border-t-4 border-orange-400 md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <div className="flex justify-between items-center">
                <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                  Student Registration Form
                </h1>
                {/* <img src={logo} alt="" className='w-24' /> */}
              </div>

              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleStudentRegister}
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
                    placeholder="Enter your email address"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div>
                  <select
                    name="grade"
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between w-full p-2 border border-gray-500 rounded-md">
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
                    className=" rounded-lg outline-none h-8 focus:ring-0"
                    onChange={(e) => setdob(e.target.value)} // Capture the date input
                    required
                    placeholder="Data of Birth"
                  />
                </div>
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="bg-gray-50 border border-gray-900 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label
                    className="text-sm font-medium text-gray-900  cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    Show Password
                  </label>
                </div>

                <div className="w-full">
                  <button className="bg-orange-400 text-white w-full p-2 rounded-md">
                    Register
                  </button>
                </div>

                <a className="text-center flex items-center justify-center text-sm font-medium text-primary-600 ">
                  Already Have Account?{" "}
                  <Link to={"/student-login"} className="underline ml-1">
                    {" "}
                    Sign in
                  </Link>
                </a>
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

export default Parentlog;




