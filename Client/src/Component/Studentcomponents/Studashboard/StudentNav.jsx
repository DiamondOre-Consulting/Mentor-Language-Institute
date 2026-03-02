import React, { useState } from "react";
import logo from "..//..//..//assets/logo.png";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import StudentProfile from "./StudentProfile";
import { logout } from "../../../api/auth";

const StudentNav = ({ student, onProfileUpdated }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout("/student-login");
  };

  const initials = student?.name
    ? student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(254,215,170,0.6)",
        boxShadow: "0 2px 16px -8px rgba(249,115,22,0.12)",
      }}
    >
      {/* Orange accent bar at very top */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)" }} />

      <div
        style={{
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.625rem 1.25rem",
          maxWidth: "80rem",
        }}
      >
        {/* Logo */}
        <Link to="/main-dashboard" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img
            src={logo}
            style={{ height: "clamp(2.25rem, 5vw, 3rem)", width: "auto" }}
            alt="Mentor Institute logo"
          />
        </Link>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Student name chip */}
          {student?.name && (
            <div
              style={{
                display: "none",
                alignItems: "center",
                gap: "0.4rem",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "999px",
                padding: "0.3rem 0.75rem 0.3rem 0.35rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#c2410c",
              }}
              className="sm:flex"
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#f97316,#fbbf24)",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initials}
              </span>
              {student.name.split(" ")[0]}
            </div>
          )}

          {/* Profile button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.875rem",
              borderRadius: "999px",
              border: "1.5px solid #fed7aa",
              background: "#fff",
              color: "#c2410c",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.borderColor = "#f97316"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#fed7aa"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Profile
          </button>

          {/* Help dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.875rem",
                  borderRadius: "999px",
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r=".5" fill="currentColor" />
                </svg>
                Help
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <DropdownMenuLabel>Need support?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1.5 px-3 py-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 text-foreground font-medium">
                  <span>📞</span> +91-9999466159
                </p>
                <p className="flex items-center gap-2 break-words">
                  <span>✉️</span> mentor.languageclasses@gmail.com
                </p>
                <p className="flex items-start gap-2 text-xs leading-relaxed">
                  <span className="mt-0.5">📍</span>
                  F-4/1, Golf Course Rd, Block F, DLF Phase 1, Sector 26A, Gurugram, Haryana-122002
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.875rem",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(249,115,22,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(249,115,22,0.3)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="max-h-[80vh] overflow-y-auto p-6">
            <StudentProfile
              student={student}
              onUpdated={onProfileUpdated}
              variant="modal"
            />
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default StudentNav;
