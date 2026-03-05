import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../api/useApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

const parseClassDateParts = (dateStr = "") => {
  const parts = String(dateStr).split(/[-/]/).map((part) => part.trim());
  if (parts.length < 3) return null;

  let yearPart = "";
  let monthPart = "";
  let dayPart = "";

  if (parts[0].length === 4) {
    yearPart = parts[0];
    monthPart = parts[1];
    dayPart = parts[2];
  } else {
    dayPart = parts[0];
    monthPart = parts[1];
    yearPart = parts[2];
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
};

const toDateFromParts = (parts) => {
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKeyFromParts = (parts) => {
  if (!parts) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};

const formatDate = (value) => {
  const date = toDateFromParts(parseClassDateParts(value));
  if (!date) return "TBA";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const [hh, mm] = String(value).split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return value;
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const isSlotLocked = (dateStr, slot, hours = 3) => {
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) return false;
  const parts = parseClassDateParts(dateStr);
  if (!parts) return false;
  const [hh, mm] = slot.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  const dt = new Date(parts.year, parts.month - 1, parts.day, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) return false;
  const lockTime = new Date(dt.getTime() - hours * 60 * 60 * 1000);
  return new Date() >= lockTime;
};

const ScheduledClasses = ({ teacherData }) => {
  const { get, put } = useApi();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateSession, setUpdateSession] = useState(null);
  const [newSlots, setNewSlots] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await get({
          url: "/teachers/my-classes",
          headers: { Authorization: `Bearer ${token}` },
        }).unwrap();
        if (response.status === 200) {
          setClasses(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load scheduled classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!updateOpen) {
      setUpdateSession(null);
      setNewSlots([]);
      setUpdateError("");
    }
  }, [updateOpen]);

  const reloadClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await get({
        url: "/teachers/my-classes",
        headers: { Authorization: `Bearer ${token}` },
      }).unwrap();
      if (response.status === 200) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error("Failed to reload classes:", error);
    }
  };

  const teacherId = teacherData?.userId || teacherData?._id;

  const scheduledSessions = useMemo(() => {
    const sessions = [];
    classes.forEach((cls) => {
      (cls.dailyClasses || []).forEach((entry) => {
        if (teacherId && entry.teacherId && String(entry.teacherId) !== String(teacherId)) {
          return;
        }
        sessions.push({
          classId: cls._id,
          classTitle: cls.classTitle,
          grade: cls.grade,
          classDate: entry.classDate,
          numberOfClasses: entry.numberOfClasses,
          mode: entry.mode || "offline",
          timeSlots: Array.isArray(entry.timeSlots) ? entry.timeSlots : [],
          dateObj: toDateFromParts(parseClassDateParts(entry.classDate)),
          dateKey: toDateKeyFromParts(parseClassDateParts(entry.classDate)),
        });
      });
    });

    return sessions.sort((a, b) => {
      const aTime = a.dateObj ? a.dateObj.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dateObj ? b.dateObj.getTime() : Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;
      return String(a.classTitle || "").localeCompare(String(b.classTitle || ""));
    });
  }, [classes, teacherId]);

  const filteredSessions = useMemo(() => {
    const dateFilterKey = dateFilter ? dateFilter : null;
    return scheduledSessions.filter((session) => {
      if (modeFilter !== "all" && session.mode !== modeFilter) {
        return false;
      }
      if (dateFilterKey) {
        if (!session.dateKey) return false;
        return session.dateKey === dateFilterKey;
      }
      return true;
    });
  }, [scheduledSessions, modeFilter, dateFilter]);

  const openUpdateDialog = (session) => {
    setUpdateSession(session);
    const existing = Array.isArray(session.timeSlots) ? session.timeSlots : [];
    setNewSlots(existing.length > 0 ? [...existing] : [""]);
    setUpdateError("");
    setUpdateOpen(true);
  };

  const handleAddSlot = () => {
    setNewSlots((prev) => [...prev, ""]);
  };

  const handleRemoveSlot = (index) => {
    setNewSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSlots = async () => {
    if (!updateSession) return;
    const trimmed = newSlots.map((slot) => String(slot || "").trim());
    const filled = trimmed.filter(Boolean);
    if (filled.length === 0) {
      setUpdateError("Please add at least one new time slot.");
      return;
    }
    const unique = new Set(filled);
    if (unique.size !== filled.length) {
      setUpdateError("Each slot time must be unique.");
      return;
    }
    const existingSlots = Array.isArray(updateSession.timeSlots)
      ? updateSession.timeSlots
      : [];
    const lockedExisting = existingSlots.filter((slot) =>
      isSlotLocked(updateSession.classDate, slot)
    );
    for (const lockedSlot of lockedExisting) {
      if (!filled.includes(lockedSlot)) {
        setUpdateError("Locked slots cannot be removed or changed.");
        return;
      }
    }

    const lockedViolations = filled.filter(
      (slot) => !lockedExisting.includes(slot) && isSlotLocked(updateSession.classDate, slot)
    );
    if (lockedViolations.length > 0) {
      setUpdateError("You cannot set slots within 3 hours of their start time.");
      return;
    }

    setUpdating(true);
    setUpdateError("");
    try {
      const token = localStorage.getItem("token");
      const response = await put({
        url: `/teachers/schedule-class/${updateSession.classId}`,
        data: {
          date: updateSession.classDate,
          mode: updateSession.mode,
          timeSlots: filled,
        },
        headers: { Authorization: `Bearer ${token}` },
      }).unwrap();

      if (response.status === 200) {
        await reloadClasses();
        setUpdateOpen(false);
      } else {
        setUpdateError("Unable to add slots right now.");
      }
    } catch (error) {
      setUpdateError(
        error?.response?.data?.message || "Unable to add slots right now."
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-5 py-4 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/40 blur-2xl" />
        <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700">
              Scheduled Classes
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
              Your upcoming sessions
            </h2>
            <p className="text-sm text-slate-500">
              View, filter, and track the classes you have scheduled.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-orange-100 bg-white/90 px-4 py-3 text-center shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
              <p className="text-xl font-semibold text-slate-900">{scheduledSessions.length}</p>
            </div>
            <div className="rounded-xl border border-orange-100 bg-white/90 px-4 py-3 text-center shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Filtered</p>
              <p className="text-xl font-semibold text-slate-900">{filteredSessions.length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
        You can update class timings only until 3 hours before the start time. Slots within 3 hours are locked.
      </div>

      {loading ? (
        <div className="mt-5 text-sm text-slate-500">Loading scheduled classes...</div>
      ) : scheduledSessions.length === 0 ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No scheduled classes yet.
        </div>
      ) : (
        <>
          <div className="mt-5 mb-4 flex flex-wrap items-end gap-4 rounded-2xl border border-orange-100 bg-white/95 px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Filter by date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Mode
              </label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setModeFilter("all");
                setDateFilter("");
              }}
              className="ml-auto rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No scheduled classes match the selected filters.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSessions.map((session, idx) => {
                const lockedSlots = (session.timeSlots || []).filter((slot) =>
                  isSlotLocked(session.classDate, slot)
                );

                return (
                  <div
                    key={`${session.classId}-${session.classDate}-${session.mode}-${idx}`}
                    className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-orange-100 bg-white/95 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-500 via-amber-400 to-orange-200" />
                    <div className="min-w-[220px]">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {session.grade || "General"}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {session.classTitle}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                        {session.mode}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Date:</span>{" "}
                      {formatDate(session.classDate)}
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Mode:</span>{" "}
                      {session.mode}
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Hours:</span>{" "}
                      {session.numberOfClasses || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateDialog(session)}
                      >
                        Edit Slots
                      </Button>
                    </div>
                    <div className="w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Time Slots:
                      </span>
                      {session.timeSlots.length > 0 ? (
                        <span className="ml-2 inline-flex flex-wrap gap-2">
                          {session.timeSlots.map((slot, slotIndex) => (
                            <span
                              key={`${session.classId}-${slot}-${slotIndex}`}
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                                lockedSlots.includes(slot)
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              {formatTime(slot)}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="ml-2 text-slate-400">TBA</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Time Slots</DialogTitle>
            <DialogDescription>
              {updateSession?.classTitle} • {formatDate(updateSession?.classDate)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {updateSession?.timeSlots?.length > 0 &&
              updateSession.timeSlots.some((slot) =>
                isSlotLocked(updateSession.classDate, slot)
              ) && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700">
                  <p className="font-semibold">Locked Slots (within 3 hours)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {updateSession.timeSlots
                      .filter((slot) =>
                        isSlotLocked(updateSession.classDate, slot)
                      )
                      .map((slot, idx) => (
                        <span
                          key={`${slot}-${idx}`}
                          className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-rose-700"
                        >
                          {formatTime(slot)}
                        </span>
                      ))}
                  </div>
                </div>
              )}

            <div className="grid gap-3">
              <Label>Edit Slots</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {newSlots.map((slot, idx) => {
                  const locked = updateSession
                    ? isSlotLocked(updateSession.classDate, slot)
                    : false;
                  return (
                  <div
                    key={`new-slot-${idx}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      Slot {idx + 1}
                    </span>
                    <input
                      type="time"
                      value={slot}
                      disabled={locked}
                      onChange={(e) =>
                        setNewSlots((prev) => {
                          const next = [...prev];
                          next[idx] = e.target.value;
                          return next;
                        })
                      }
                      className={`ml-auto rounded-md border px-2 py-1 text-sm ${
                        locked
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    />
                    {newSlots.length > 1 && !locked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    )}
                    {locked && (
                      <span className="text-[10px] font-semibold text-rose-600">
                        Locked
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={handleAddSlot}>
                + Add Slot
              </Button>
              <p className="text-xs text-slate-500">
                Slots within 3 hours of start time are locked and cannot be edited or removed.
              </p>
            </div>

            {updateError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {updateError}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSlots} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledClasses;
