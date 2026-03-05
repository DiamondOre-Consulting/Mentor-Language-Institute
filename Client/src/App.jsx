import "./App.css";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import UserVerify from "./Component/Auth/ProtectedRoute";
import ResetPassword from "./Component/Auth/ResetPassword";
import SiteFooter from "./Component/Common/SiteFooter";
import AppErrorBoundary from "./Component/Common/AppErrorBoundary";
import RouteSkeleton from "./Component/Common/RouteSkeleton";
import axios from "./api/axiosInstance";
import { initScrollReveal } from "./utils/scrollReveal";

const Parentsignup = lazy(() =>
  import("./Component/Studentcomponents/Stuauth/Parentsignup")
);
const Admin = lazy(() => import("./Pages/Adminpages/Admin"));
const Login = lazy(() => import("./Component/TeacherAdminAuthentication/Login"));
const Maindash = lazy(() => import("./Pages/Studentpages/Maindash"));
const StudentEachcourses = lazy(() =>
  import("./Pages/Studentpages/StudentEachcourses")
);
const Teachermain = lazy(() => import("./Pages/Teacherpages/Teachermain"));
const Error = lazy(() => import("./Component/Studentcomponents/Stuauth/Error"));

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
};

function App() {
  useEffect(() => {
    let active = true;
    const bootstrapSession = async () => {
      try {
        await axios.post("/auth/refresh");
        if (active) {
          localStorage.setItem("token", "session");
        }
      } catch (error) {
        if (active) {
          localStorage.removeItem("token");
        }
      }
    };

    const handleSubmit = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    document.addEventListener("submit", handleSubmit);

    // Initialize site-wide scroll-reveal animations
    const cleanup = initScrollReveal();

    bootstrapSession();

    return () => {
      document.removeEventListener("submit", handleSubmit);
      active = false;
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div className="premium-edu">
      <BrowserRouter>
        <ScrollToTop />
        <AppErrorBoundary>
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/">
                <Route index element={<Parentsignup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student-login" element={<Login defaultTab="student" />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* <Route path='/student-chat' element={<StudentChat/>}/> */}
                <Route element={<UserVerify routeName="students" />}>
                  <Route path="/main-dashboard" element={<Maindash />} />
                  <Route
                    path="/student-each-course/:id"
                    element={<StudentEachcourses />}
                  />
                </Route>
                <Route element={<UserVerify routeName="admin-confi" />}>
                  <Route path="/admin-dashboard/*" element={<Admin />} />
                </Route>

                <Route element={<UserVerify routeName="teachers" />}>
                  <Route path="/teacher-dashboard/*" element={<Teachermain />} />
                </Route>

                {/* <Route path='/teacher/chat/*' element={<ChatTeacher/>}/> */}
                <Route path="*" element={<Error />} />
              </Route>
            </Routes>
          </Suspense>
        </AppErrorBoundary>
        <SiteFooter />
      </BrowserRouter>
    </div>
  );
}

export default App;
