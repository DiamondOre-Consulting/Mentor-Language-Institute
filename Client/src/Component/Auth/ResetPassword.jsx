import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApi } from "../../api/useApi";

const ResetPassword = () => {
  const { post } = useApi();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get("token") || "";
  const role = (params.get("role") || "").toLowerCase();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loginPath = role === "student" ? "/student-login" : "/login";
  const invalidLink = !token || !["admin", "teacher", "student"].includes(role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (invalidLink) {
      setStatus("Reset link is invalid or missing.");
      return;
    }
    const nextErrors = {
      password:
        !password || password.length < 6
          ? "Password must be at least 6 characters."
          : "",
      confirm:
        !confirm
          ? "Confirm password is required."
          : password !== confirm
            ? "Passwords do not match."
            : "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setLoading(true);
    try {
      const response = await post({
        url: "/auth/reset-password",
        data: {
          role,
          token,
          password,
        },
      }).unwrap();

      if (response.status === 200) {
        setStatus("Password reset successfully. You can now log in.");
      } else {
        setStatus("Unable to reset password.");
      }
    } catch (error) {
      setStatus(
        error?.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
      <p className="mt-1 text-sm text-slate-500">
        Create a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              setErrors((prev) => ({
                ...prev,
                password:
                  !value || value.length < 6
                    ? "Password must be at least 6 characters."
                    : "",
                confirm:
                  confirm && value !== confirm ? "Passwords do not match." : prev.confirm,
              }));
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            placeholder="Enter new password"
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              const value = e.target.value;
              setConfirm(value);
              setErrors((prev) => ({
                ...prev,
                confirm:
                  !value
                    ? "Confirm password is required."
                    : value !== password
                      ? "Passwords do not match."
                      : "",
              }));
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            placeholder="Confirm new password"
            required
          />
          {errors.confirm && (
            <p className="mt-1 text-xs text-rose-600">{errors.confirm}</p>
          )}
        </div>
        {status && <p className="text-xs text-slate-600">{status}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to={loginPath} className="text-indigo-600 hover:text-indigo-700">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
