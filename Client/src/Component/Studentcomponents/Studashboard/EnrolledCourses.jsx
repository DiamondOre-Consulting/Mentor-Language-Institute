import { useApi } from "../../../api/useApi";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

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

const getPrimaryTeacherName = (course) => {
  const teacher = course?.teachers?.find((item) => item?.teacherId)?.teacherId;
  return teacher?.name || "To be assigned";
};

const getNextSession = (course) => {
  const sessions = (course?.dailyClasses || [])
    .map((entry) => {
      const date = new Date(entry.classDate);
      if (Number.isNaN(date.getTime())) return null;
      return { ...entry, date };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (sessions.length === 0) return null;

  const today = new Date();
  const nextSession =
    sessions.find((session) => session.date >= today) ||
    sessions[sessions.length - 1];

  return {
    label: formatDate(nextSession.classDate),
    count: nextSession.numberOfClasses,
  };
};

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const { get } = useApi();
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Token not found in local storage, handle the error or redirect to the login page
          console.error("No token found");
          navigate("/student-login");
          return;
        }

        // Fetch associates data from the backend
        const response = await get({
          url: "/students/my-profile",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status == 200) {
          // console.log(response.data.classes);

          const classes = response.data.classes;
          const allClassResponses = await Promise.allSettled(
            classes.map((classId) =>
              get({
                url: `/students/all-courses/${classId}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).unwrap()
            )
          );

          const allClassData = allClassResponses
            .filter(
              (result) =>
                result.status === "fulfilled" &&
                result.value.status === 200 &&
                result.value.data
            )
            .map((result) => result.value.data);

          setClassData(allClassData);
        } else {
          // console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, []);

  return (
    <section className="mt-8">
      <Card className="border-orange-100/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle id="enrolledcourse" className="text-2xl sm:text-3xl">
            Enrolled Courses
          </CardTitle>
          <CardDescription>Quick access to your active programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {classData.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border bg-accent/40 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  No enrolled courses yet. Ask your mentor to enroll you.
                </p>
              </div>
            ) : (
              classData.map((course) => (
                <Card
                  key={course._id}
                  className="group relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-2xl border border-orange-100/70 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-200" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.12),_transparent_45%)] opacity-0 transition group-hover:opacity-100" />
                  <CardHeader className="relative z-10 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="w-fit">
                        Enrolled
                      </Badge>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        {course.grade || "All levels"}
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-base break-words [overflow-wrap:anywhere] leading-snug text-slate-900 sm:text-lg md:text-xl line-clamp-2">
                      {course.classTitle}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mentor: {getPrimaryTeacherName(course)}
                    </p>
                  </CardHeader>
                  <CardContent className="relative z-10 flex flex-col gap-3 pt-0">
                    <div className="space-y-2 text-xs text-muted-foreground">                      
                      <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide">Hours</p>
                        <p className="font-semibold text-slate-700">
                          {course.totalHours
                            ? `${course.totalHours} hrs`
                            : "TBA"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border/80 bg-white/70 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide">Mentor</p>
                        <p className="font-semibold text-slate-700">
                          {getPrimaryTeacherName(course)}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="mt-auto w-full justify-between rounded-lg">
                      <Link to={`/student-each-course/${course._id}`}>
                        View Details
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default EnrolledCourses;
