import { useState } from "react";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { validateRequired } from "../../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const StudentLogin = () => {
  const navigate = useNavigate();
  const { post } = useApi();
  const [userName, setUserName] = useState("");
  const [password, SetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const nextErrors = {
      userName: validateRequired(userName, "Username"),
      password: validateRequired(password, "Password"),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    setLoading(true);

    try {
      const response = await post({
        url: "/students/login",
        data: {
          userName,
          password,
        },
      }).unwrap();

      if (response.status === 200) {
        const token = response.data.token;
        // Store the token in local storage
        localStorage.setItem("token", token);
        navigate("/main-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid UserName ");
        } else if (status === 402) {
          setError("Your account has been deactivated!!");
        } else if (status === 403) {
          setError("invalid Password");
        } else {
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
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
          role: "student",
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
      <div className="mt-20 md:mt-12 flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-lg px-8 py-6 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-1 ">LOGIN</h1>
          <div className="h-0.5 w-full max-w-xs sm:max-w-sm md:max-w-md rounded bg-orange-500 mb-4"></div>
          <form onSubmit={handleStudentLogin} className="" autoComplete="off">
            <div className="mb-4">
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700  mb-2"
              >
                username
              </label>
              <input
                type="text"
                name="userName"
                value={userName}
                onChange={(e) => {
                  const value = e.target.value;
                  setUserName(value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    userName: validateRequired(value, "Username"),
                  }));
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter UserName"
                required
              />
              {fieldErrors.userName && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.userName}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700  mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 text-sm rounded-lg shadow-sm border-1 pe-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    SetPassword(value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: validateRequired(value, "Password"),
                    }));
                  }}
                  name="password"
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.password}
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
                    onChange={() => setShowPassword((prev) => !prev)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300    "
                    required=""
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500 ">
                    Show password
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/"
                className="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResetIdentifier("");
                  setResetStatus("");
                  setResetError("");
                  setResetOpen(true);
                }}
                className="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

          {error && (
            <div className="flex items-center justify-center p-4 bg-red-300 rounded-md">
              <p className="text-sm text-center text-red-500">{error}</p>
            </div>
          )}
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
                setResetError(
                  value.trim() ? "" : "Email/phone/username is required."
                );
              }}
              placeholder="Email, phone, or username"
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

export default StudentLogin;
