import React, { useState } from "react";
import cbse from "..//..//..//assets/cbse.jpg";
import ib from "..//..//..//assets/ib.jpg";
import icse from "..//..//..//assets/icse.png";
import igcse from "..//..//..//assets/igcse.jpg";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const Classes = () => {
  const [popup, setPopUp] = useState(false);

  return (
    <div className="mt-8 space-y-8">
      <Card className="border-orange-100/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Classes Curriculum</CardTitle>
          <CardDescription>All subjects for foundational and advanced grades.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid cursor-pointer grid-cols-1 gap-3 lg:grid-cols-5" onClick={() => setPopUp(true)}>
            <div className="relative h-52 overflow-hidden rounded-xl border border-border lg:col-span-2">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://png.pngtree.com/thumb_back/fh260/background/20230521/pngtree-desk-with-books-and-candles-in-front-of-skyline-image_2700508.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative flex h-full flex-col items-center justify-center text-white">
                <h3 className="text-2xl font-bold">Grade 1-10</h3>
                <p>All Subjects</p>
              </div>
            </div>

            <div className="relative h-52 overflow-hidden rounded-xl border border-border lg:col-span-3">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://c4.wallpaperflare.com/wallpaper/504/398/329/historical-books-wallpaper-preview.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative flex h-full flex-col items-center justify-center text-center text-white">
                <h3 className="text-2xl font-bold">Grade 11-12</h3>
                <p className="px-3 font-semibold">Humanities, Accounts, Economics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-100/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Boards</CardTitle>
          <CardDescription>CBSE, IB, ICSE, and IGCSE supported.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid cursor-pointer grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5"
            onClick={() => setPopUp(true)}
          >
            <div
              className="h-48 rounded-xl border border-border bg-cover bg-center md:col-span-2 lg:h-60"
              style={{ backgroundImage: `url(${cbse})` }}
            />
            <div
              className="h-48 rounded-xl border border-border bg-cover bg-center md:col-span-2 lg:col-span-3 lg:h-60"
              style={{ backgroundImage: `url(${ib})` }}
            />
            <div
              className="h-48 rounded-xl border border-border bg-cover bg-center md:col-span-2 lg:col-span-3 lg:h-60"
              style={{ backgroundImage: `url(${icse})` }}
            />
            <div
              className="h-48 rounded-xl border border-border bg-cover bg-center md:col-span-2 lg:col-span-2 lg:h-60"
              style={{ backgroundImage: `url(${igcse})` }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={popup} onOpenChange={setPopUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please contact the institute directly.</DialogTitle>
            <DialogDescription>
              Curriculum alignment and board-specific enrollment is coordinated by our team.
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
    </div>
  );
};

export default Classes;
