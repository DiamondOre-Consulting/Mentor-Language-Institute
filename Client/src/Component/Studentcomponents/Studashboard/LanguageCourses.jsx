import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getScheduleSummary = (course) => {
  const entries = course?.dailyClasses || [];
  const totalSessions = entries.reduce(
    (total, entry) => total + toNumber(entry.numberOfClasses),
    0
  );
  const upcoming = entries
    .map((entry) => {
      const date = new Date(entry.classDate);
      if (Number.isNaN(date.getTime())) return null;
      return { ...entry, date };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)
    .map((entry) => ({
      label: formatDate(entry.classDate),
      count: entry.numberOfClasses,
    }));

  return { totalSessions, upcoming };
};

const getMentorNames = (course) =>
  (course?.teachers || [])
    .map((teacher) => teacher?.teacherId?.name)
    .filter(Boolean)
    .join(", ");

const LanguageCourses = () => {
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupEnroll, setShowPopupEnroll] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);

  const handleEnrollClose = () => {
    setShowPopupEnroll(false);
  };

  const handleEnrollClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowPopup(true);
    setPopupMessage(null);
  };

  const settings = {
    centerMode: true,
    centerPadding: "60px",
    slidesToShow: 5,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 1,
        },
      },
    ],
  };

  const [Eachcourse, setEachCourse] = useState(null);
  useEffect(() => {
    const fetchEachCourse = async () => {
      try {
        if (selectedCourseId) {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found");
            navigate("/login");
            return;
          }
          const response = await get({
            url: `/students/all-courses/${selectedCourseId}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();
          if (response.status === 200) {
            setEachCourse(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchEachCourse();
  }, [selectedCourseId]);

  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/students/all-courses",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status == 200) {
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchAllcourses();
  }, []);

  const scheduleSummary = getScheduleSummary(Eachcourse);
  const mentorNames = getMentorNames(Eachcourse);

  const handleApplyCourse = async (courseId) => {
    try {
      setPopupMessage(null);
      setShowPopup(false);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await post({
        url: `/students/apply-course/${courseId}`,
        data: {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setShowPopup(false);
        setShowPopupEnroll(true);
        setSelectedCourseId(null);
      } else {
        console.log("some errors occurred");
      }
    } catch (error) {
      console.error("Error applying in course:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("You Have Already Applied For This Course!!!");
          setShowPopup(false);
        } else if (status === 408) {
          setPopupMessage("You Are Already Enrolled In This Course!!!");
          setShowPopup(false);
        }
      }
    }
  };

  const CourseCard = ({ course }) => {
    const schedule = getScheduleSummary(course);

    return (
      <Card className="group relative flex h-full min-h-[14rem] flex-col overflow-hidden rounded-xl border border-orange-100/70 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-200" />
        <CardHeader className="relative z-10 pb-2 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {course.grade || "General"}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {schedule.totalSessions ? `${schedule.totalSessions} sessions` : "TBA"}
            </span>
          </div>
          <CardTitle className="text-sm font-bold leading-tight text-slate-900 sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
            {course.classTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 mt-auto flex flex-col gap-3 pb-4 px-4 sm:px-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-[11px]">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wide text-slate-400">Duration</span>
              <span className="font-semibold text-slate-700">{course.totalHours || "--"} hrs</span>
            </div>
          </div>
          <Button
            size="sm"
            className="h-9 w-full bg-orange-500 hover:bg-orange-600 shadow-sm rounded-lg text-xs font-semibold tracking-wide"
            onClick={() => handleEnrollClick(course._id)}
          >
            Explore Plan
            <svg
              className="ml-1.5 h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <section className="mt-8" id="courses">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Available Programs</CardTitle>
            <CardDescription>Browse current course offerings and apply instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="slider-container py-8">
              {allCourses.length > 3 ? (
                <Slider {...settings}>
                  {allCourses.map((course) => (
                    <div key={course._id} className="px-2 h-full">
                      <CourseCard course={course} />
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                  {allCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-2xl p-0">
          <div className="grid overflow-hidden rounded-lg md:grid-cols-2">
            <img
              src="https://t4.ftcdn.net/jpg/06/23/40/73/360_F_623407391_wtq6RVJUq2RGb2e3D0ykn5zJOqfJhOSc.jpg"
              className="hidden h-full w-full object-cover md:block"
              alt="Course preview"
            />
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl">{Eachcourse?.classTitle}</DialogTitle>
                <DialogDescription>
                  Review the course plan before submitting your application.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-white/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide">Grade</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {Eachcourse?.grade || "All levels"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-white/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide">Total Hours</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {Eachcourse?.totalHours ? `${Eachcourse.totalHours} hrs` : "TBA"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-white/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide">Total Sessions</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {scheduleSummary.totalSessions || "TBA"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-white/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide">Branch</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {Eachcourse?.branch || "Main"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide">Mentors</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {mentorNames || "To be assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide">Schedule Preview</p>
                  {scheduleSummary.upcoming.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {scheduleSummary.upcoming.map((entry, index) => (
                        <div
                          key={`${entry.label}-${index}`}
                          className="flex items-center justify-between rounded-md border border-border bg-white/70 px-3 py-2 text-xs text-slate-700"
                        >
                          <span>{entry.label}</span>
                          <span className="font-semibold">
                            {entry.count ? `${entry.count} class(es)` : "Session"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Schedule will be shared once enrollment is confirmed.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Added on</span>
                  <span className="font-semibold text-slate-700">
                    {formatDate(Eachcourse?.createdAt)}
                  </span>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button className="w-full" onClick={() => handleApplyCourse(selectedCourseId)}>
                  Apply Now
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPopupEnroll} onOpenChange={setShowPopupEnroll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank you for applying!</DialogTitle>
            <DialogDescription>We will connect you soon.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={handleEnrollClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(popupMessage)}
        onOpenChange={(open) => {
          if (!open) setPopupMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Heads up</DialogTitle>
            <DialogDescription className="text-sm">{popupMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setPopupMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .slick-prev,
        .slick-next {
          width: 42px;
          height: 42px;
          background-color: rgb(249 115 22);
          border: 1px solid rgb(249 115 22);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          z-index: 1;
        }

        .slick-prev:hover,
        .slick-next:hover {
          background-color: rgb(249 115 22);
        }

        .slick-prev {
          left: 0px;
        }

        .slick-next {
          right: 0px;
        }
      `}</style>
    </>
  );
};

export default LanguageCourses;
