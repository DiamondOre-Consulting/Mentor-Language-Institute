import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import insta from "../../assets/instagram.png";
import facebook from "../../assets/facebook.png";
import whatsapp from "../../assets/whatsapp.png";
import linkedin from "../../assets/linkedin.png";
import youtube from "../../assets/youtube.png";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { useApi } from "../../api/useApi";
import { logout } from "../../api/auth";

const navItems = [
  { label: "Home", to: "/admin-dashboard/", icon: "home" },
  { label: "Register", to: "/admin-dashboard/register", icon: "register" },
  { label: "All Students", to: "/admin-dashboard/allstudents", icon: "users" },
  { label: "All Teachers", to: "/admin-dashboard/allteachers", icon: "users" },
  { label: "All Courses", to: "/admin-dashboard/allcourses", icon: "users" },
  { label: "Enrollment Requests", to: "/admin-dashboard/messages", icon: "request" },
  { label: "Pending Payments", to: "/admin-dashboard/pending-payments", icon: "payment" },
  { label: "Pending Commissions", to: "/admin-dashboard/pending-commissions", icon: "payment" },
  { label: "All Admin", to: "/admin-dashboard/all-admin", icon: "admin" },
  { label: "Attendance Report", to: "/admin-dashboard/attendance-report", icon: "admin" },
];

const renderIcon = (icon) => {
  if (icon === "home") {
    return (
      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (icon === "register") {
    return (
      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M5 6a3 3 0 1 1 4 2.83V10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8.83a3.001 3.001 0 1 1 2 0V10a3 3 0 0 1-3 3h-1v2.17a3.001 3.001 0 1 1-2 0V13h-1a3 3 0 0 1-3-3V8.83A3.001 3.001 0 0 1 5 6Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (icon === "admin") {
    return (
      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
      </svg>
    );
  }
  if (icon === "payment") {
    return (
      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2V6Z" />
        <path fillRule="evenodd" d="M2 11h20v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm6 3a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H8Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (icon === "request") {
    return (
      <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 8.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7.5M14 3h7m0 0v7m0-7L13 11" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
      <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
    </svg>
  );
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { get } = useApi();

  const handleWhatsAppChat = () => {
    window.open(`https://api.whatsapp.com/send?phone=${encodeURIComponent("8130265929")}`, "_blank");
  };

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) return;
        const response = await get({
          url: "/admin-confi/payment-requests?status=pending&requestType=enrollment",
          headers: { Authorization: `Bearer ${currentToken}` },
        }).unwrap();
        if (response.status === 200) setRequestCount((response.data || []).length);
      } catch (error) {
        console.error("Error fetching enrollment request count:", error);
      }
    };
    fetchRequestCount();
  }, []);

  const handleLogout = () => {
    logout("/login");
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", height: "100%", flexDirection: "column", overflow: "hidden", padding: "1.25rem 1rem" }}>
      {/* Logo + Admin chip */}
      <div style={{ marginBottom: "1.25rem" }} data-sr="fade-down">
        <img src={logo} style={{ height: "3rem", width: "auto" }} alt="Mentor Logo" />
        <div
          style={{
            marginTop: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #fff7ed, #fffbf5)",
            border: "1px solid #fed7aa",
            borderRadius: "0.75rem",
            padding: "0.5rem 0.75rem",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #fbbf24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Admin Panel</p>
            <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0 }}>Full Access</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item, idx) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/admin-dashboard/" && location.pathname.startsWith(item.to));

            return (
              <li key={item.to} className={item.hidden ? "hidden" : ""} data-sr="fade-left" data-sr-delay={idx * 30}>
                <Link
                  to={item.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "0.75rem",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#fff" : "#475569",
                    background: isActive ? "linear-gradient(135deg, #f97316, #fb923c)" : "transparent",
                    boxShadow: isActive ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                    transition: "all 0.18s",
                    borderLeft: "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#fff7ed";
                      e.currentTarget.style.color = "#c2410c";
                      e.currentTarget.style.borderLeftColor = "#f97316";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#475569";
                      e.currentTarget.style.borderLeftColor = "transparent";
                    }
                  }}
                >
                  <span style={{ color: isActive ? "rgba(255,255,255,0.9)" : "#94a3b8", flexShrink: 0 }}>
                    {renderIcon(item.icon)}
                  </span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                  {item.label === "Enrollment Requests" && (
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "20px",
                        height: "20px",
                        padding: "0 6px",
                        borderRadius: "999px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: isActive ? "rgba(255,255,255,0.25)" : "#f97316",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {requestCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                border: "none",
                background: "transparent",
                color: "#475569",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s",
                borderLeft: "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.color = "#dc2626";
                e.currentTarget.style.borderLeftColor = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderLeftColor = "transparent";
              }}
            >
              <svg className="h-5 w-5" style={{ color: "inherit" }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
              </svg>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </ScrollArea>

      <Separator className="my-4" />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} data-sr="zoom" data-sr-delay="400">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.625rem", background: "#fff", border: "1px solid #fed7aa55", borderRadius: "0.875rem", padding: "0.625rem" }}>
          {[
            { href: "https://www.instagram.com/mentorlanguage/", src: insta, alt: "Instagram" },
            { href: "https://www.facebook.com/mentorlanguage/", src: facebook, alt: "Facebook" },
            { onClick: handleWhatsAppChat, src: whatsapp, alt: "WhatsApp" },
            { href: "https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true", src: linkedin, alt: "LinkedIn" },
            { href: "https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7", src: youtube, alt: "YouTube" },
          ].map((s) => {
            const img = (
              <img src={s.src} alt={s.alt} style={{ width: "22px", transition: "transform 0.2s, opacity 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
              />
            );
            return s.onClick
              ? <button key={s.alt} onClick={s.onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>{img}</button>
              : <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" style={{ display: "flex" }}>{img}</a>;
          })}
        </div>

        <div style={{ background: "#fff", border: "1px solid #fed7aa55", borderRadius: "0.875rem", padding: "0.625rem", textAlign: "center", fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.6 }}>
          <span style={{ display: "block" }}>
            Designed &amp; Developed by{" "}
            <a href="https://www.doclabz.com/" target="_blank" rel="noreferrer" style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}>DOC-LABZ</a>
          </span>
          <span style={{ display: "block" }}>&copy; 2024 Mentor Institute. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 border-orange-200 bg-white/95 text-orange-700 shadow-md backdrop-blur sm:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <aside
            style={{
              height: "100%",
              borderRight: "1px solid #fed7aa44",
              background: "linear-gradient(180deg, #fff7ed 0%, #fff3e0 20%, #ffffff 60%)",
            }}
          >
            <SidebarContent />
          </aside>
        </SheetContent>
      </Sheet>

      <aside
        id="logo-sidebar"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 40,
          height: "100vh",
          width: "18rem",
          borderRight: "1px solid #fed7aa44",
          background: "linear-gradient(180deg, #fff7ed 0%, #fff3e0 20%, #ffffff 60%)",
          boxShadow: "4px 0 24px -8px rgba(249,115,22,0.12)",
        }}
        className="hidden sm:block"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
