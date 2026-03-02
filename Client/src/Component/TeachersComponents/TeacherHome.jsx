import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
 

const TeacherHome = ({ teacherData }) => {
  const navigate = useNavigate();
  const { get, post, put } = useApi();
  const [showPopup, setShowPopup] = useState(false);
  const [showScheduleClass, setShowScheduleClass] = useState(false);
  const [classesData, setClassesData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(null);
  const [numberOfClasses, setNumberOfClasses] = useState(0);
  const [oneClassDetails, setOneClassDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateHoursInput, setUpdateHoursInput] = useState(0);
  const [showUpdateHoursPopup, setShowUpdateHoursPopup] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    const day = selectedDate.getDate().toString().padStart(2, "0");
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = selectedDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setDate(formattedDate);
  };

  const handleView = (classId, totalHours) => {
    setSelectedClassId(classId);
    setUpdateHoursInput(totalHours || 0);
    setShowUpdateHoursPopup(true);
  };

  const fetchAllTeachersCourses = async () => {
    try {
      const classIds = teacherData?.myClasses;

      const classesData = [];
      for (const classId of classIds) {
        const classResponse = await get({
          url: `/teachers/my-classes/${classId}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).unwrap();
        if (classResponse.status === 200) {
          classesData.push(classResponse.data);
        }
      }
      setClassesData(classesData);
    } catch (error) {
      console.error("Error fetching teachers' classes:", error);
    }
  };

  useEffect(() => {
    if (teacherData?.myClasses?.length > 0) {
      fetchAllTeachersCourses();
    }
  }, [teacherData]);

  useEffect(() => {
    const allDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const classresponse = await get({
          url: `/teachers/my-classes/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (classresponse.status === 200) {
          const oneclass = classresponse.data;
          setOneClassDetails(oneclass);
        }
      } catch (error) {
        // Handle error
      }
    };

    if (selectedClassId) {
      allDetails();
    }
  }, [selectedClassId]);

  const handleScheduleClass = async () => {
    try {
      setShowLoader(true);

      const response = await post({
        url: `/teachers/schedule-class/${selectedClassId}`,
        data: { date, numberOfClasses },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setShowScheduleClass(false);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 2000);
        setShowLoader(false);
      }
    } catch (error) {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    const fetchAllcourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/teachers/my-classes",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setClassesData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllcourses();
  }, []);

  const handleUpdateHours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await put({
        url: `/teachers/update-class-hours/${selectedClassId}`,
        data: { updatedHours: updateHoursInput },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        fetchAllTeachersCourses();
        setShowUpdateHoursPopup(false);
      }
    } catch (error) {
      console.error("Failed to update hours:", error);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem" }}>

        {/* ── Welcome banner ── */}
        <div
          data-sr="fade-down"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fffbf0 100%)",
            border: "1px solid #fed7aa66",
            padding: "clamp(1.25rem, 4vw, 1.75rem)",
            boxShadow: "0 4px 24px -8px rgba(249,115,22,0.14)",
          }}
        >
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(251,191,36,0.14)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.7rem", fontWeight: 700, color: "#4338ca", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.625rem" }}>
              🎓 Teacher Dashboard
            </span>
            <h1 style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em", margin: "0 0 0.375rem" }}>
              Welcome,{" "}
              <span style={{ color: "#f97316" }}>{teacherData?.name || "Teacher"}</span>
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
              Track your courses, schedule sessions, and support your learners.
            </p>
          </div>
        </div>

        {/* ── Section header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>My Courses</h2>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.125rem 0 0" }}>Manage attendance and class hours.</p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#fff",
              borderRadius: "999px",
              padding: "0.25rem 0.75rem",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {classesData.length} Active
          </span>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <ClipLoader color={"#f97316"} loading={loading} size={32} />
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.125rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {classesData.map((course, i) => (
              <div
                key={course._id}
                data-sr="zoom"
                data-sr-delay={i * 80}
                style={{
                  borderRadius: "1.125rem",
                  overflow: "hidden",
                  background: "#fff",
                  border: "1.5px solid #fed7aa55",
                  boxShadow: "0 2px 16px -8px rgba(249,115,22,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 28px -8px rgba(249,115,22,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px -8px rgba(249,115,22,0.1)"; }}
              >
                {/* Card header with gradient */}
                <div style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", padding: "1rem 1.125rem" }}>
                  <span style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "999px", padding: "0.2rem 0.625rem", fontSize: "0.65rem", fontWeight: 700, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Course
                  </span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {course.classTitle}
                  </h3>
                </div>

                {/* Card actions */}
                <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {/* Update hours button */}
                  <button
                    onClick={() => handleView(course._id, course.totalHours)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0.55rem 0.875rem",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fed7aa"; e.currentTarget.style.background = "#fff7ed"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span>⏱️ Total hours</span>
                    <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", color: "#fff", borderRadius: "999px", padding: "0.15rem 0.5rem", fontSize: "0.72rem", fontWeight: 700 }}>
                      {course.totalHours || 0}
                    </span>
                  </button>

                  {/* Schedule class button */}
                  <button
                    onClick={() => { setSelectedClassId(course._id); setShowScheduleClass(true); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0.55rem 0.875rem",
                      borderRadius: "0.75rem",
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fed7aa"; e.currentTarget.style.background = "#fff7ed"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span>📅 Schedule Class</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
                  </button>

                  {/* View students link */}
                  <Link
                    to={`/teacher-dashboard/allstudents/${course?._id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "0.75rem",
                      background: "linear-gradient(135deg, #f97316, #fb923c)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    👥 View Students
                    <svg className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Class Scheduled</DialogTitle>
            <DialogDescription>Your class has been scheduled successfully.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleClass} onOpenChange={setShowScheduleClass}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Class</DialogTitle>
            <DialogDescription>{oneClassDetails.classTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={date ? date.split("-").reverse().join("-") : ""}
                onChange={handleDateChange}
              />
            </div>
            <div className="grid gap-2">
              <Label>Number of Classes</Label>
              <Input
                type="number"
                value={numberOfClasses}
                onChange={(e) => setNumberOfClasses(e.target.value)}
                placeholder="Enter number of classes"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleScheduleClass} disabled={showLoader}>
              {showLoader ? "Scheduling..." : "Schedule Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateHoursPopup} onOpenChange={setShowUpdateHoursPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Total Hours</DialogTitle>
            <DialogDescription>Adjust the total hours for this course.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={updateHoursInput}
              onChange={(e) => setUpdateHoursInput(e.target.value)}
              className="w-28"
            />
            <Button onClick={handleUpdateHours}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherHome;
