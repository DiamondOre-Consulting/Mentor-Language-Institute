import React, { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import { getToastVariant } from "../../utils/toastVariant";
import {
  normalizeDigits,
  validateEmail,
  validatePhone,
  validateRequired,
} from "../../utils/validators";

const TeacherProfile = ({ teacherData, onProfileUpdated }) => {
  const { put } = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    password: "",
  });

  const toastVariant = getToastVariant(popupMessage);

  useEffect(() => {
    if (!teacherData) return;
    setFormValues({
      name: teacherData?.name || "",
      phone: teacherData?.phone || "",
      email: teacherData?.email || "",
      dob: teacherData?.dob ? String(teacherData.dob).split("T")[0] : "",
      password: "",
    });
  }, [teacherData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "phone" ? normalizeDigits(value).slice(0, 10) : value;
    setFormValues((prev) => ({ ...prev, [name]: nextValue }));
    if (name === "name") {
      setErrors((prev) => ({ ...prev, name: validateRequired(nextValue, "Name") }));
    }
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(nextValue) }));
    }
    if (name === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(nextValue) }));
    }
  };

  const resetForm = () => {
    setFormValues({
      name: teacherData?.name || "",
      phone: teacherData?.phone || "",
      email: teacherData?.email || "",
      dob: teacherData?.dob ? String(teacherData.dob).split("T")[0] : "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleCancel = () => {
    resetForm();
    setPopupMessage(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setPopupMessage(null);
    const nextErrors = {
      name: validateRequired(formValues.name, "Name"),
      email: validateEmail(formValues.email),
      phone: validatePhone(formValues.phone),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPopupMessage("Session expired. Please log in again.");
        return;
      }

      const payload = {
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        dob: formValues.dob,
        ...(formValues.password ? { password: formValues.password } : {}),
      };

      const response = await put({
        url: "/teachers/my-profile",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response?.status === 200) {
        setPopupMessage("Profile updated successfully.");
        setIsEditing(false);
        setFormValues((prev) => ({ ...prev, password: "" }));
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        setPopupMessage("Error updating profile.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Error updating profile.";
      setPopupMessage(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-full h-40">
        <img
          src="https://t4.ftcdn.net/jpg/03/16/92/61/360_F_316926143_cVdnI6bJPbhlo1yZVTJk0R0sjBx4vVnO.jpg"
          className="w-full h-full rounded-tl-lg rounded-tr-lg"
        />
      </div>
      <div className="flex flex-col items-center -mt-20">
        <img
          src="data:image/png;base64,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"
          className="w-40 border-4 border-white rounded-full"
        />
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-2xl">{teacherData?.name}</p>
          <span className="bg-blue-500 rounded-full p-1" title="Verified">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-100 h-2.5 w-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </span>
        </div>
      </div>
      {/* <div className="flex-1 flex flex-col items-center lg:items-end justify-end px-8 mt-2">
                <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                        </svg>
                        <span>Connect</span>
                    </button>
                    <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                        </svg>
                        <span>Message</span>
                    </button>
                </div>
            </div> */}

      <div className="my-4 flex flex-col 2xl:flex-row space-y-4 2xl:space-y-0 2xl:space-x-4">
        <div className="w-full flex flex-col 2xl:w-1/3">
          <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xl text-gray-900 font-bold">Personal Info</h4>
              {!isEditing && (
                <button
                  type="button"
                  className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            {!isEditing && (
              <ul className="mt-2 text-gray-700">
                <li className="flex border-y py-2">
                  <span className="font-bold w-24">Full name:</span>
                  <span className="text-gray-700">{teacherData?.name}</span>
                </li>

                <li className="flex border-b py-2">
                  <span className="font-bold w-24">Email:</span>
                  <span className="text-gray-700">
                    {teacherData?.email || "Not set"}
                  </span>
                </li>

                <li className="flex border-b py-2">
                  <span className="font-bold w-24">Mobile:</span>
                  <span className="text-gray-700">{teacherData?.phone}</span>
                </li>

                <li className="flex border-b py-2">
                  <span className="font-bold w-24">DOB:</span>
                  <span className="text-gray-700">
                    {teacherData?.dob
                      ? String(teacherData.dob).split("T")[0]
                      : "Not set"}
                  </span>
                </li>
              </ul>
            )}
            {isEditing && (
              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    required
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formValues.dob}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formValues.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <label
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      Show Password
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-white bg-orange-400 rounded-md disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
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
            <p className="pt-2 text-sm font-semibold">{popupMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherProfile;
