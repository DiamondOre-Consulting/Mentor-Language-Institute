import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { getToastVariant } from "../../utils/toastVariant";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const EditStudent = () => {
  const navigate = useNavigate();
  const { get, put } = useApi();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setdob] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastVariant = getToastVariant(popupMessage);

  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const studentResponse = await get({
          url: `/admin-confi/all-students/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        const dateString = studentResponse?.data?.dob;
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        if (studentResponse?.status === 200) {
          setName(studentResponse?.data?.name || "");
          setPhone(studentResponse?.data?.phone || "");
          setdob(studentResponse?.data?.dob || "");
          setDateOfBirth(formattedDate);
          setUserName(studentResponse?.data?.userName || "");
          setEmail(studentResponse?.data?.email || "");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, token]);

  useEffect(() => {
    const hasOpenModal = loading || !!popupMessage;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, popupMessage]);

  const handleStudentEdit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      const response = await put({
        url: `/admin-confi/student-edit/${id}`,
        data: {
          name,
          phone,
          password,
          userName,
          email,
          dob,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Edited Successfully");
        setPassword("");
      } else if (response.status === 400) {
        setPopupMessage(response.data.message);
      } else {
        setPopupMessage("Error Editing Student");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setPopupMessage(error.response.data.message);
      } else {
        setPopupMessage("Error Editing Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <section className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Student</h1>
            <p className="mt-1 text-sm text-slate-500">Update profile information without changing any workflow.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back
          </button>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleStudentEdit}>
          <div className="sm:col-span-2">
            <label htmlFor="userName" className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              name="userName"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Please enter a unique username"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="phone"
              name="phone"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className="mb-1 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Existing: {dateOfBirth || "N/A"}
            </div>
            <input
              type="date"
              id="dob"
              value={dob}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              onChange={(e) => setdob(e.target.value)}
              placeholder="Date of Birth"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
              Show Password
            </label>
          </div>

          <div className="sm:col-span-2">
            <button className="w-full rounded-lg bg-orange-500 p-2.5 text-sm font-semibold text-white hover:bg-orange-600">
              Save Changes
            </button>
          </div>
        </form>
      </section>

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
            <p className="pt-2 text-sm font-semibold">{popupMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditStudent;


