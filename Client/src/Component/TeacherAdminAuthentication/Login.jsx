import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Studentcomponents/Stuauth/Navbar";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { validateRequired } from "../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Login = ({ defaultTab }) => {
  const { post } = useApi();
  const location = useLocation();
  const resolveDefaultTab = () => {
    const role = new URLSearchParams(location.search).get("role");
    const normalizedRole = role ? role.toLowerCase() : "";
    if (defaultTab === "student" || location.pathname === "/student-login") {
      return 2;
    }
    if (defaultTab === "teacher" || normalizedRole === "teacher") {
      return 1;
    }
    if (defaultTab === "admin" || normalizedRole === "admin") {
      return 0;
    }
    if (normalizedRole === "student") {
      return 2;
    }
    return 0;
  };

  const [activeTab, setActiveTab] = useState(resolveDefaultTab);
  const [teacherIdentifier, setTeacherIdentifier] = useState("");
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [adminErrors, setAdminErrors] = useState({});
  const [teacherErrors, setTeacherErrors] = useState({});
  const [studentErrors, setStudentErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetRole, setResetRole] = useState("admin");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // ADMIN LOGIN
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const nextErrors = {
      identifier: validateRequired(adminIdentifier, "Email or username"),
      password: validateRequired(adminPassword, "Password"),
    };
    setAdminErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }
    // Perform login logic here
    try {
      const response = await post({
        url: "/admin-confi/login-admin",
        data: {
          identifier: adminIdentifier,
          email: adminIdentifier,
          password: adminPassword,
        },
      }).unwrap();
      // console.log("inside")

      if (response.status === 200) {
        // console.log(response.data)
        localStorage.setItem("token", "session");
        // console.log("Logged in successfully as Admin");
        navigate("/admin-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid email or username.");
        } else {
          console.error("Error logging in:", status);
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // TEACHER LOGIN

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const nextErrors = {
      identifier: validateRequired(teacherIdentifier, "Email or mobile number"),
      password: validateRequired(teacherPassword, "Password"),
    };
    setTeacherErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    setLoading(true);

    try {
      const response = await post({
        url: "/teachers/login-teacher",
        data: {
          identifier: teacherIdentifier,
          password: teacherPassword,
        },
      }).unwrap();

      if (response.status === 200) {
        localStorage.setItem("token", "session");
        // console.log("Logged in successfully as Teacher");
        navigate("/teacher-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid email or phone number");
        } else if (status === 402) {
          setError("Invalid password");
        } else {
          console.error("Error login teacher:", status);
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const nextErrors = {
      identifier: validateRequired(studentIdentifier, "Email or mobile number"),
      password: validateRequired(studentPassword, "Password"),
    };
    setStudentErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    setLoading(true);

    try {
      const response = await post({
        url: "/students/login",
        data: {
          identifier: studentIdentifier,
          password: studentPassword,
        },
      }).unwrap();

      if (response.status === 200) {
        localStorage.setItem("token", "session");
        navigate("/main-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid email or phone number");
        } else if (status === 402) {
          setError("Your account has been deactivated!!");
        } else if (status === 403) {
          setError("Invalid Password");
        } else {
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    setError(null);
    if (index === 0) setAdminErrors({});
    if (index === 1) setTeacherErrors({});
    if (index === 2) setStudentErrors({});
  };

  const openResetDialog = (role) => {
    setResetRole(role);
    setResetIdentifier("");
    setResetStatus("");
    setResetError("");
    setResetOpen(true);
  };

  const handleResetRequest = async () => {
    if (!resetIdentifier.trim()) {
      setResetError("Email/phone/username is required.");
      setResetStatus("Please enter your email/phone/username.");
      return;
    }
    setResetLoading(true);
    setResetStatus("");
    setResetError("");
    try {
      const response = await post({
        url: "/auth/request-password-reset",
        data: {
          role: resetRole,
          identifier: resetIdentifier.trim(),
        },
      }).unwrap();
      if (response.status === 200) {
        setResetStatus("If an account exists, a reset link has been sent.");
      } else {
        setResetStatus("Unable to send reset link right now.");
      }
    } catch (error) {
      setResetStatus("Unable to send reset link right now.");
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(resolveDefaultTab());
  }, [location.pathname, location.search, defaultTab]);

  return (
    <>
      <Navbar />
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
      <div className="mt-6 sm:mt-10 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center">
          <div className="sm:py-4 w-full">
            {activeTab === 0 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Admin
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleAdminLogin}
                        autoComplete="off"
                      >
                        <div>
                          <input
                            type="text"
                            name="adminIdentifier"
                            value={adminIdentifier}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAdminIdentifier(value);
                              setAdminErrors((prev) => ({
                                ...prev,
                                identifier: validateRequired(value, "Email or username"),
                              }));
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="Enter Email or Username"
                            className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                            required=""
                          />
                          {adminErrors.identifier && (
                            <p className="mt-1 text-xs text-rose-600">
                              {adminErrors.identifier}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="password" className="sr-only">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              className="w-full p-4 text-sm rounded-lg shadow-sm border-1 pe-12"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              value={adminPassword}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAdminPassword(value);
                                setAdminErrors((prev) => ({
                                  ...prev,
                                  password: validateRequired(value, "Password"),
                                }));
                              }}
                              name="adminPassword"
                              autoComplete="new-password"
                            />
                          </div>
                          {adminErrors.password && (
                            <p className="mt-1 text-xs text-rose-600">
                              {adminErrors.password}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                aria-describedby="remember"
                                id="check"
                                type="checkbox"
                                value={showPassword}
                                onChange={() =>
                                  setShowPassword((prev) => !prev)
                                }
                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300    "
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                          {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                          <button
                            type="button"
                            onClick={() => openResetDialog("admin")}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                            Login
                          </button>
                        </div>


                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {activeTab === 1 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Teacher
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleTeacherLogin}
                        autoComplete="off"
                      >
                        <div>
                          <input
                            type="text"
                            name="teacherIdentifier"
                            value={teacherIdentifier}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTeacherIdentifier(value);
                              setTeacherErrors((prev) => ({
                                ...prev,
                                identifier: validateRequired(value, "Email or mobile number"),
                              }));
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="Enter Mail or Mobile number"
                            className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                            required=""
                          />
                          {teacherErrors.identifier && (
                            <p className="mt-1 text-xs text-rose-600">
                              {teacherErrors.identifier}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="password" className="sr-only">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              className="w-full p-4 text-sm rounded-lg shadow-sm border-1 pe-12"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              value={teacherPassword}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTeacherPassword(value);
                                setTeacherErrors((prev) => ({
                                  ...prev,
                                  password: validateRequired(value, "Password"),
                                }));
                              }}
                              name="teacherPassword"
                              autoComplete="new-password"
                            />
                          </div>
                          {teacherErrors.password && (
                            <p className="mt-1 text-xs text-rose-600">
                              {teacherErrors.password}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                aria-describedby="remember"
                                id="check"
                                type="checkbox"
                                value={showPassword}
                                onChange={() =>
                                  setShowPassword((prev) => !prev)
                                }
                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300    "
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                          {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                          <button
                            type="button"
                            onClick={() => openResetDialog("teacher")}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                            Login
                          </button>
                        </div>


                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 2 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Student
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleStudentLogin}
                        autoComplete="off"
                      >
                        <div>
                          <input
                            type="text"
                            name="studentIdentifier"
                            value={studentIdentifier}
                            onChange={(e) => {
                              const value = e.target.value;
                              setStudentIdentifier(value);
                              setStudentErrors((prev) => ({
                                ...prev,
                                identifier: validateRequired(value, "Email or mobile number"),
                              }));
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="Enter Mail or Mobile number"
                            className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                            required=""
                          />
                          {studentErrors.identifier && (
                            <p className="mt-1 text-xs text-rose-600">
                              {studentErrors.identifier}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="password" className="sr-only">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              className="w-full p-4 text-sm rounded-lg shadow-sm border-1 pe-12"
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              value={studentPassword}
                              onChange={(e) => {
                                const value = e.target.value;
                                setStudentPassword(value);
                                setStudentErrors((prev) => ({
                                  ...prev,
                                  password: validateRequired(value, "Password"),
                                }));
                              }}
                              name="studentPassword"
                              autoComplete="new-password"
                            />
                          </div>
                          {studentErrors.password && (
                            <p className="mt-1 text-xs text-rose-600">
                              {studentErrors.password}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                aria-describedby="remember"
                                id="check"
                                type="checkbox"
                                value={showPassword}
                                onChange={() =>
                                  setShowPassword((prev) => !prev)
                                }
                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300    "
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openResetDialog("student")}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                            Login
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Link
                            to="/"
                            className="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Create Account
                          </Link>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="flex items-center justify-center p-4 bg-red-300 rounded-md">
                <p className="text-sm text-center text-red-500">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Enter your email, phone number and we will send a reset link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              value={resetIdentifier}
              onChange={(e) => {
                const value = e.target.value;
                setResetIdentifier(value);
                setResetError(value.trim() ? "" : "Email/phone/username is required.");
              }}
              placeholder={
                resetRole === "admin"
                  ? "Email"
                  : resetRole === "teacher"
                    ? "Email or phone"
                    : "Email, phone "
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            />
            {resetError && <p className="text-xs text-rose-600">{resetError}</p>}
            {resetStatus && (
              <p className="text-xs text-slate-600">{resetStatus}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetRequest}
              disabled={resetLoading}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {resetLoading ? "Sending..." : "Send reset link"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default Login;

