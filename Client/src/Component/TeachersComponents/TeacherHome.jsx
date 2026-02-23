import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

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
      <div className="space-y-6 p-6">
        <Card className="border-orange-100/80 bg-white/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-slate-700 sm:text-4xl">
              Welcome{" "}
              <span className="text-orange-500">
                {teacherData?.name ? teacherData?.name : "Teacher"}
              </span>
            </CardTitle>
            <CardDescription>
              Track your courses, schedule sessions, and support learners.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">My Courses</h2>
            <p className="text-sm text-muted-foreground">
              Manage attendance and class hours from here.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {classesData.length} Active
          </Badge>
        </div>

        {loading ? (
          <div style={override}>
            <ClipLoader color={"#FFA500"} loading={loading} size={30} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classesData.map((course) => (
              <Card
                className="overflow-hidden border-border/70 bg-background shadow-sm"
                key={course._id}
              >
                <CardHeader className="space-y-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                  <Badge className="w-fit border border-white/40 bg-white/15 text-white">
                    Course
                  </Badge>
                  <CardTitle className="text-xl text-white">
                    {course.classTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => handleView(course._id, course.totalHours)}
                        >
                          Total hours
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-900">
                            {course.totalHours}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Click to edit hours</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => {
                      setSelectedClassId(course._id);
                      setShowScheduleClass(true);
                    }}
                  >
                    Schedule Class
                    <svg
                      className="h-4 w-4"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Button>

                  <Button asChild size="sm" className="w-full justify-between">
                    <Link to={`/teacher-dashboard/allstudents/${course?._id}`}>
                      View Students
                      <svg
                        className="h-4 w-4"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
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
