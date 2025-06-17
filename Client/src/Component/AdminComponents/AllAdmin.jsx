import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AllAdmin = () => {
  const [allAdmin, setAllAdmin] = useState([]);
  const [id, setId] = useState();
  const [editPopupForm, setEditPopupForm] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleGetAllAdmin = async () => {
    try {
      const response = await axios.get(
        "https://mentor-backend-rbac6.ondigitalocean.app/api/admin-confi/all-admin"
      );
      setAllAdmin(response?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAdmin = async (id) => {
    const toastId = toast.loading("Deleting admin...");

    try {
      const res = await axios.delete(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/admin-confi/delete-admin/${id}`
      );

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
    setEditData({ ...editData, [name]: value });
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/admin-confi/edit-admin/${id}`,
        editData
      );
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
                  Branch: {item.branch}
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

      {editPopupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
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
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full p-2 border rounded"
              />
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
        </div>
      )}

      {deletePopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
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
        </div>
      )}
    </div>
  );
};

export default AllAdmin;
