import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Eachcourse = () => {
  const navigate = useNavigate();
  const { get } = useApi();
  const [courseDetails, setCourseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const { id } = useParams();
  // console.log(id);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);

        const response = await get({
          url: `/admin-confi/all-classes/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status !== 200 || !response.data) {
          return;
        }

        const courseData = response.data;
        setCourseDetails(courseData);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, navigate]);

  // console.log("coursedetails", courseDetails.enrolledStudents)
  return (
    <>
      <div>
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
        <h1 className="px-4 mb-4 text-2xl font-bold md:px-0 md:mb-1">
          {courseDetails?.classTitle}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex-1  bg-white rounded-lg shadow-xl p-8">
            <h4 className="text-xl text-gray-900 font-bold">Course Details</h4>
            <ul className="mt-2 text-gray-700">
              <li className="flex border-y py-2">
                <span className="font-bold w-32">Title:</span>
                <span className="text-gray-700">
                  {courseDetails?.classTitle}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-32">Total Hours:</span>
                <span className="text-gray-700">
                  {courseDetails?.totalHours}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-32">Created At:</span>
                <span className="text-gray-700">
                  {courseDetails?.createdAt
                    ? new Date(courseDetails.createdAt).toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      )
                    : "N/A"}
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1  bg-white rounded-lg shadow-xl p-8">
            <h4 className="text-xl text-gray-900 font-bold">Teacher Details</h4>
            {courseDetails?.teachers && courseDetails.teachers.length > 0 ? (
              <ul className="mt-2 space-y-3 text-gray-700">
                {courseDetails.teachers.map((assignment) => (
                  <li key={assignment?._id} className="rounded-md border border-slate-200 p-3">
                    <p>
                      <span className="font-bold">Teach By:</span>{" "}
                      <span>{assignment?.teacherId?.name || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-bold">Phone:</span>{" "}
                      <span>{assignment?.teacherId?.phone || "N/A"}</span>
                    </p>
                    <p>
                      <span className="font-bold">Offline Commission:</span>{" "}
                      <span>
                        {assignment?.offlineCommissionRate ??
                          assignment?.commissionRate ??
                          0}
                      </span>
                    </p>
                    <p>
                      <span className="font-bold">Online Commission:</span>{" "}
                      <span>
                        {assignment?.onlineCommissionRate ??
                          assignment?.commissionRate ??
                          0}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No teachers assigned.</p>
            )}
          </div>
        </div>

        <div>
          <div className="grid w-full grid-cols-2 mt-10 text-gray-800 border border-orange-500 rounded-md border-1">
            <div
              className={`text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer ${
                activeTab === "enrolled" ? "bg-orange-500 text-white" : ""
              }`}
              onClick={() => handleTabSwitch("enrolled")}
            >
              Enrolled Students
            </div>
            <div
              className={`text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer ${
                activeTab === "applied" ? "bg-orange-500 text-white" : ""
              }`}
              onClick={() => handleTabSwitch("applied")}
            >
              Applied Students
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {activeTab === "enrolled" &&
                courseDetails?.enrolledStudents &&
                courseDetails.enrolledStudents.map((student) => (
                  <div
                    key={student?._id}
                    className="p-4 text-gray-100 bg-orange-500 border rounded-md shadow-xl border-1"
                  >
                    <p>
                      Name: <span>{student?.name}</span>
                    </p>
                    <p>
                      Phone: <span>{student?.phone}</span>
                    </p>
                  </div>
                ))}
              {activeTab === "applied" &&
                courseDetails?.appliedStudents &&
                courseDetails.appliedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="p-4 text-gray-100 bg-orange-500 border rounded-md shadow-xl border-1"
                  >
                    <p>
                      Name: <span>{student?.name}</span>
                    </p>
                    <p>
                      Phone: <span>{student?.phone}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Eachcourse;


