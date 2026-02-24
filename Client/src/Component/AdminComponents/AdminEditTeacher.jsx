import { useState, useEffect } from "react";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { IoClose } from "react-icons/io5";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const AdminEditTeacher = ({ teacherDetails, closingModel, id, onUpdated }) => {
  const { get, put } = useApi();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  //   const [userName, setUserName] = useState("");
  const [dob, setdob] = useState("");

  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [teacherCourseId, setTeacherCourseId] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (teacherDetails) {
      setName(teacherDetails.name || "");
      setPhone(teacherDetails.phone || "");
      //   setUserName(teacherDetails.userName || "");
      setdob(teacherDetails.dob || "");
      setPassword("");

    }
  }, [teacherDetails]);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response = await get({
          url: "/admin-confi/all-classes",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setAllCourses(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (token) {
      fetchAllCourses();
    }
  }, [token, get]);

  const handleTeacherEdit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);
    console.log(id, name, phone, password, dob)
    try {
      const payload = {
        name,
        phone,
        password,
        dob,
      };
      if (teacherCourseId) {
        payload.courseId = teacherCourseId;
      }

      const response = await put({
        url: `/admin-confi/teacher-edit/${id}`,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Teacher Edited Successfully");
        setName("");
        setPhone("");
        setPassword("");
        setTeacherCourseId("");
        await onUpdated?.();
      } else if (response.status === 400) {
        setPopupMessage(response.data.message);
      } else {
        setPopupMessage("Error Editing Teacher");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setPopupMessage(error.response.data.message);
        } else {
          setPopupMessage("Error Editing Teacher");
        }
      } else {
        setPopupMessage("Error Editing Teacher");
      }
    } finally {
      setLoading(false);
      closingModel();
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
                onSubmit={handleTeacherEdit}
              >

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

                <select
                  id="teacherCourseId"
                  name="teacherCourseId"
                  value={teacherCourseId}
                  onChange={(e) => setTeacherCourseId(e.target.value)}
                  className="w-full p-2 border border-gray-500 rounded-md"
                >
                  <option value="">Assign Course (Optional)</option>
                  {allCourses.map((course) => (
                    <option key={course?._id} value={course?._id}>
                      {course?.classTitle}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between w-full p-2 border border-gray-500 rounded-md">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 "
                    htmlFor="dob"
                  >
                    {teacherDetails?.dob?.split("T")[0]}
                  </label>
                  <input
                    type="date"
                    id="dob"
                    value={dob}
                    className="h-8 rounded-lg outline-none focus:ring-0"
                    onChange={(e) => setdob(e.target.value)}
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
                <div className="app-modal-overlay app-modal-overlay--top">
                  <div className="app-modal-card app-modal-card-sm relative">
                    <svg
                      className="absolute right-4 top-4 h-6 w-6 cursor-pointer text-red-500"
                      onClick={() => setPopupMessage(null)}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <path stroke="none" d="M0 0h24v24H0z" />{" "}
                      <line x1="18" y1="6" x2="6" y2="18" />{" "}
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <p className="mt-6 text-lg font-bold text-emerald-600">
                      {popupMessage}
                    </p>
                    {/* <button className="px-4 py-2 text-white bg-orange-500 rounded-md" onClick={() => setPopupMessage(null)}>Close</button> */}
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

export default AdminEditTeacher;


