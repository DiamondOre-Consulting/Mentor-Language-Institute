import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import adminhome1 from "../../assets/adminhome1.jpg";
import adminhome2 from "../../assets/adminhome2.jpg";
import adminhome3 from "../../assets/adminhome3.jpg";
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

const Home = () => {
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/admin-login");
          return;
        }

        const response = await get({
          url: "/admin-confi/all-students",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setAllStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchAllStudents();
  }, [navigate]);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/admin-confi/all-classes",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchAllCourses();
  }, [navigate]);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/admin-login");
          return;
        }

        const response = await get({
          url: "/admin-confi/all-teachers",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setAllTeachers(response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchAllTeachers();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await post({
        url: "/admin-confi/signup-admin",
        data: formData,
      }).unwrap();

      if (response.status === 201) {
        setPopupMessage("New Admin Has Been Created Successfully!");
        setIsFormOpen(false);
        setFormData({ name: "", phone: "", password: "" });
        setUserName(response.data.newAdmin.username);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("Admin Already Exists");
        }
      }
    }
  };

  const cards = [
    {
      title: "All Students",
      countLabel: "Total students",
      count: allStudents.length,
      to: "/admin-dashboard/allstudents",
      image: adminhome1,
    },
    {
      title: "All Teachers",
      countLabel: "Total teachers",
      count: allTeachers.length,
      to: "/admin-dashboard/allteachers",
      image: adminhome2,
    },
    {
      title: "All Courses",
      countLabel: "Total courses",
      count: allCourses.length,
      to: "/admin-dashboard/allcourses",
      image: adminhome3,
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <Card className="border-orange-100/70 bg-gradient-to-r from-white via-orange-50 to-orange-100/40">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-700 sm:text-3xl">
                Welcome <span className="text-orange-600">Admin</span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base">
                Manage students, teachers, courses, and operations from one place.
              </CardDescription>
            </div>

            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              Add Admin
            </Button>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.title}
              className="overflow-hidden border-border/70 bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img className="h-full w-full object-cover" src={card.image} alt={card.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <Badge variant="secondary" className="absolute bottom-3 left-3">
                  Overview
                </Badge>
              </div>

              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>
                  {card.countLabel}: <span className="font-semibold text-foreground">{card.count}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={card.to}>
                    Explore More
                    <svg
                      className="ms-2 h-3.5 w-3.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>Create a new admin profile.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 rounded border-border"
              />
              Show Password
            </label>

            <DialogFooter className="pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Close
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(popupMessage)}
        onOpenChange={(open) => {
          if (!open) setPopupMessage("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{popupMessage}</DialogTitle>
            {userName && (
              <DialogDescription className="space-y-1 text-sm">
                <span className="block text-foreground">
                  Your UserName is <span className="text-lg font-bold">{userName}</span>
                </span>
                <span className="block text-red-700">
                  Please write down this username somewhere.
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setPopupMessage("")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Home;
