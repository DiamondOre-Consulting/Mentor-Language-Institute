import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useApi } from "../../api/useApi";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { normalizeDigits, validatePhone, validateRequired } from "../../utils/validators";

const AllAdmin = () => {
  const [allAdmin, setAllAdmin] = useState([]);
  const { get, put, del } = useApi();
  const [id, setId] = useState();
  const [editPopupForm, setEditPopupForm] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const handleGetAllAdmin = async () => {
    try {
      const response = await get({
        url: "/admin-confi/all-admin",
      }).unwrap();
      setAllAdmin(response?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAdmin = async (id) => {
    const toastId = toast.loading("Deleting admin...");

    try {
      await del({
        url: `/admin-confi/delete-admin/${id}`,
      }).unwrap();

      toast.success("Admin deleted!", { id: toastId });
      await handleGetAllAdmin();
    } catch (err) {
      toast.error("Failed to delete admin", { id: toastId });
    }
  };

  const handleEditClick = (item) => {
    setEditPopupForm(true);
    setEditData({ name: item.name, phone: item.phone, password: "" });
    setId(item?._id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? normalizeDigits(value).slice(0, 10) : value;
    setEditData({ ...editData, [name]: nextValue });
    if (name === "name") {
      setErrors((prev) => ({ ...prev, name: validateRequired(nextValue, "Name") }));
    }
    if (name === "phone") {
      setErrors((prev) => ({ ...prev, phone: validatePhone(nextValue) }));
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validateRequired(editData.name, "Name"),
      phone: validatePhone(editData.phone),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    try {
      await put({
        url: `/admin-confi/edit-admin/${id}`,
        data: editData,
      }).unwrap();
      await handleGetAllAdmin();
      toast.success("Admin Updated successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setEditPopupForm(false);
    }
  };

  useEffect(() => {
    handleGetAllAdmin();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold">All Admin</h1>
      <div className="w-20 h-0.5 bg-black"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {allAdmin.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 p-6 bg-white"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Admin
                </h2>
                <p className="text-sm text-gray-600">Phone: {item.phone}</p>
                <p className="text-sm text-gray-600">Name: {item.name}</p>
                <p className="text-sm text-gray-600">
                  Username: {item.username}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button className="p-2 border rounded-full hover:bg-gray-100">
                  <FaEdit
                    className="text-blue-600 w-4 h-4"
                    onClick={() => handleEditClick(item)}
                  />
                </button>
                <button className="p-2 border rounded-full hover:bg-gray-100">
                  <FaTrash
                    className="text-red-600 w-4 h-4"
                    onClick={() => {
                      setDeletePopup(true);
                      setDeleteId(item._id);
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editPopupForm &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-sm">
              <h3 className="text-lg font-semibold mb-4">Edit Admin</h3>
              <form onSubmit={handleEditAdmin} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="w-full p-2 border rounded"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600">{errors.name}</p>
                )}
                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full p-2 border rounded"
                  inputMode="numeric"
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-600">{errors.phone}</p>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={editData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full p-2 border rounded pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditPopupForm(false)}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {deletePopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this admin?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeletePopup(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteAdmin(deleteId);
                    setDeletePopup(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AllAdmin;


