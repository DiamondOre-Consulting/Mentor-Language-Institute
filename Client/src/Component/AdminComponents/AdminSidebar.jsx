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
   {
    label: "Enrollment Requests",
    to: "/admin-dashboard/messages",
    icon: "request",
  },
  {
    label: "Pending Payments",
    to: "/admin-dashboard/pending-payments",
    icon: "payment",
  },
  {
    label: "Chats",
    to: "/admin-dashboard/admin/chat/",
    icon: "users",
    hidden: true,
  },
  { label: "All Admin", to: "/admin-dashboard/all-admin", icon: "admin" },
  {
    label: "Attendance Report",
    to: "/admin-dashboard/attendance-report",
    icon: "admin",
  },
];

const renderIcon = (icon) => {
  if (icon === "home") {
    return (
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (icon === "register") {
    return (
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          d="M5 6a3 3 0 1 1 4 2.83V10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8.83a3.001 3.001 0 1 1 2 0V10a3 3 0 0 1-3 3h-1v2.17a3.001 3.001 0 1 1-2 0V13h-1a3 3 0 0 1-3-3V8.83A3.001 3.001 0 0 1 5 6Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (icon === "admin") {
    return (
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
      </svg>
    );
  }

  if (icon === "payment") {
    return (
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2V6Z" />
        <path
          fillRule="evenodd"
          d="M2 11h20v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm6 3a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H8Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (icon === "request") {
    return (
      <svg
        className="h-5 w-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M20 8.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7.5M14 3h7m0 0v7m0-7L13 11"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 18"
    >
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
    const phoneNumber = "8130265929";
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(
      phoneNumber
    )}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      navigate("/login");
    }
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
          url: "/admin-confi/all-students",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }).unwrap();

        if (response.status === 200) {
          const students = response.data || [];
          const total = students.reduce(
            (sum, student) => sum + (student?.appliedClasses?.length || 0),
            0
          );
          setRequestCount(total);
        }
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
    <div className="flex h-full flex-col overflow-hidden px-4 py-5">
      <div className="mb-5 flex items-center justify-between">
        <img src={logo} className="h-12 sm:h-14" alt="Mentor Logo" />
      </div>

      <ScrollArea className="flex-1 pr-2">
        <ul className="space-y-1.5 text-sm font-medium text-slate-700">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/admin-dashboard/" &&
                location.pathname.startsWith(item.to));

            return (
              <li key={item.to} className={item.hidden ? "hidden" : ""}>
                <Link
                  to={item.to}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow"
                      : "hover:bg-orange-100/70 hover:text-orange-700"
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-primary-foreground"
                        : "text-slate-500 group-hover:text-orange-600"
                    }
                  >
                    {renderIcon(item.icon)}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.label === "Enrollment Requests" && (
                    <span
                      className={`ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-orange-500 text-white"
                      }`}
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
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition-all hover:bg-rose-50 hover:text-rose-600"
            >
              <svg
                className="h-5 w-5 text-slate-500 group-hover:text-rose-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                />
              </svg>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </ScrollArea>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-3 rounded-xl border border-orange-100 bg-white p-3">
          <a href="https://www.instagram.com/mentorlanguage/" target="_blank" rel="noreferrer">
            <img src={insta} alt="Instagram" className="w-6" />
          </a>
          <a href="https://www.facebook.com/mentorlanguage/" target="_blank" rel="noreferrer">
            <img src={facebook} alt="Facebook" className="w-6" />
          </a>
          <button onClick={handleWhatsAppChat} className="text-left">
            <img src={whatsapp} alt="WhatsApp" className="w-6" />
          </button>
          <a
            href="https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true"
            target="_blank"
            rel="noreferrer"
          >
            <img src={linkedin} alt="LinkedIn" className="w-6" />
          </a>
          <a
            href="https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7"
            target="_blank"
            rel="noreferrer"
          >
            <img src={youtube} alt="YouTube" className="w-6" />
          </a>
        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-3 text-center text-xs text-slate-500">
          <span className="block">
            Designed &amp; Developed by{" "}
            <a
              href="https://www.doclabz.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-orange-500 hover:underline"
            >
              DOC-LABZ
            </a>
            .
          </span>
          <span className="mt-1 block">
            &copy; 2024 Mentor Institute. All Rights Reserved.
          </span>
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
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <aside className="h-full border-r border-orange-100 bg-gradient-to-b from-orange-50 via-white to-white">
            <SidebarContent />
          </aside>
        </SheetContent>
      </Sheet>

      <aside
        id="logo-sidebar"
        className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-orange-100 bg-gradient-to-b from-orange-50 via-white to-white shadow-xl sm:block"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
