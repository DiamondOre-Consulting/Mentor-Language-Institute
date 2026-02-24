import React, { useState } from "react";
import logo from "..//..//..//assets/logo.png";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
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

  return (
    <nav className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/main-dashboard" className="flex items-center">
          <img src={logo} className="h-10 sm:h-12 md:h-14" alt="Mentor Institute logo" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setIsProfileOpen(true)}
          >
            Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                Help
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <DropdownMenuLabel>Need support?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1 px-2 py-1.5 text-sm text-muted-foreground">
                <p className="text-foreground">Phone: +91-9999466159</p>
                <p className="break-words">Email: mentor.languageclasses@gmail.com</p>
                <p className="text-xs leading-relaxed">
                  F-4/1, Golf Course Rd, Block F, DLF Phase 1, Sector 26A, Gurugram,
                  Haryana-122002
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="rounded-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

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
