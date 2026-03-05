import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import adminhome1 from "../../assets/adminhome1.jpg";
import adminhome2 from "../../assets/adminhome2.jpg";
import adminhome3 from "../../assets/adminhome3.jpg";
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
    email: "",
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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        navigate("/admin-login");
        return;
      }

      const response = await post({
        url: "/admin-confi/signup-admin",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 201) {
        setPopupMessage("New Admin Has Been Created Successfully!");
        setIsFormOpen(false);
        setFormData({ name: "", email: "", phone: "", password: "" });
        setUserName(response.data.newAdmin.username);
      }
    } catch (error) {
      const status = error?.response?.status || error?.status;
      if (status === 409) {
        setPopupMessage("Admin Already Exists");
      } else if (status === 400) {
        setPopupMessage(error?.response?.data?.message || "Please fill all required fields.");
      } else if (status === 401 || status === 403) {
        setPopupMessage("Unauthorized. Please log in again.");
      } else {
        setPopupMessage("Failed to create admin.");
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
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── Welcome banner ── */}
        <div
          data-sr="fade-down"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fffbf0 100%)",
            border: "1px solid #fed7aa66",
            padding: "clamp(1.25rem, 4vw, 2rem)",
            boxShadow: "0 4px 24px -8px rgba(249,115,22,0.14)",
          }}
        >
          {/* Decorative blob */}
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.7rem", fontWeight: 700, color: "#c2410c", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                👋 Admin Dashboard
              </span>
              <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em", margin: 0 }}>
                Welcome, <span style={{ color: "#f97316" }}>Admin</span>
              </h1>
              <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#64748b", maxWidth: "480px" }}>
                Manage students, teachers, courses, and all platform operations from one place.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "0.875rem",
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(249,115,22,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.35)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
              Add Admin
            </button>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {cards.map((card, i) => (
            <div
              key={card.title}
              data-sr="zoom"
              data-sr-delay={i * 100}
              style={{
                borderRadius: "1.125rem",
                overflow: "hidden",
                background: "#fff",
                border: "1.5px solid #fed7aa55",
                boxShadow: "0 2px 16px -8px rgba(249,115,22,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px -8px rgba(249,115,22,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px -8px rgba(249,115,22,0.1)"; }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: "11rem", overflow: "hidden" }}>
                <img src={card.image} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.65), transparent 60%)" }} />
                <span
                  style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    left: "0.875rem",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "999px",
                    padding: "0.2rem 0.625rem",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Overview
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: "1rem 1.125rem 1.125rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.25rem" }}>{card.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 0.875rem" }}>
                  {card.countLabel}:{" "}
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.35rem",
                      color: "#f97316",
                      display: "inline-block",
                      lineHeight: 1,
                    }}
                  >
                    {card.count}
                  </span>
                </p>
                <Link
                  to={card.to}
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
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Explore More
                  <svg className="h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </Link>
              </div>
            </div>
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
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
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
