import React, { useState } from "react";
import ielts from "..//..//..//assets/ielts.jpg";
import sat from "..//..//..//assets/sat.jpg";
import toefl from "..//..//..//assets/toefl.jpg";
import ap from "..//..//..//assets/ap.jpg";
import english from "..//..//..//assets/english.webp";
import personality from "..//..//..//assets/persnality.webp";
import cuet from "..//..//..//assets/cuet1.jpg";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const specialCourseImages = [
  { src: ielts, title: "IELTS", style: "bg-cover bg-center" },
  { src: sat, title: "SAT", style: "bg-cover bg-center" },
  { src: toefl, title: "TOEFL", style: "bg-cover bg-center" },
  { src: ap, title: "AP", style: "bg-cover bg-center" },
  { src: cuet, title: "CUET", style: "bg-contain bg-center bg-no-repeat" },
  { src: english, title: "Spoken English", style: "bg-cover bg-top md:bg-center" },
  {
    src: personality,
    title: "Personality Development",
    style: "bg-contain bg-center bg-no-repeat md:col-span-2 lg:col-span-3",
  },
];

const SpecialCourses = () => {
  const [popup, setPopUp] = useState(false);

  return (
    <>
      <section className="mt-8">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl sm:text-3xl">Special Courses</CardTitle>
            <Badge variant="secondary" className="w-fit">
              Contact to enroll
            </Badge>
          </CardHeader>
          <CardContent>
            <div
              className="grid cursor-pointer grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
              onClick={() => setPopUp(true)}
            >
              {specialCourseImages.map((item) => (
                <div
                  key={item.title}
                  className={`group relative h-44 overflow-hidden rounded-xl border border-border shadow-sm md:h-52 ${item.style}`}
                  style={{ backgroundImage: `url(${item.src})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent opacity-80 transition group-hover:opacity-100" />
                  <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={popup} onOpenChange={setPopUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please contact the institute directly.</DialogTitle>
            <DialogDescription>
              These premium tracks are scheduled with a counselor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Call us: +91 9999466159</p>
            <p>Email: mentor.languageclasses@gmail.com</p>
            <p>
              F-4/1, Golf Course Rd, Block F, DLF Phase 1, Sector 26A, Gurugram,
              Haryana-122002
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setPopUp(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpecialCourses;
