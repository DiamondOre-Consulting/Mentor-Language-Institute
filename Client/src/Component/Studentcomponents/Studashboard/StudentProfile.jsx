import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../../api/useApi";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { validateRequired } from "../../../utils/validators";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const StudentProfile = ({ student, onUpdated, variant = "page" }) => {
  const { put } = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    phone: "",
    dob: "",
    grade: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student?.name || "",
        userName: student?.userName || "",
        email: student?.email || "",
        phone: student?.phone || "",
        dob: toDateInputValue(student?.dob),
        grade: student?.grade || "",
      });
    }
  }, [student]);

  const completion = useMemo(() => {
    if (!student) return 0;
    const fields = ["name", "email", "phone", "userName", "dob", "grade"];
    const completed = fields.filter((field) => Boolean(student?.[field])).length;
    return Math.round((completed / fields.length) * 100);
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name") {
      setErrors((prev) => ({
        ...prev,
        name: validateRequired(value, "Full name"),
      }));
    }
    if (name === "userName") {
      setErrors((prev) => ({
        ...prev,
        userName: validateRequired(value, "Username"),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const nextErrors = {
        name: validateRequired(formData.name, "Full name"),
        userName: validateRequired(formData.userName, "Username"),
      };
      setErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        setIsSaving(false);
        return;
      }

      const payload = {
        name: formData.name,
        userName: formData.userName,
        dob: formData.dob || null,
      };

      const response = await put({
        url: "/students/update-profile",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setMessage("Profile updated successfully.");
        setIsEditing(false);
        if (onUpdated) {
          onUpdated(response.data.student);
        }
      } else {
        setError("Unable to update profile right now.");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Unable to update profile right now.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      className={variant === "page" ? "mt-8" : ""}
      id={variant === "page" ? "profile" : undefined}
    >
      <Card className="border-orange-100/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl">My Profile</CardTitle>
            <CardDescription>
              View your full details and keep them updated.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Profile {completion}%</Badge>
            <Button
              size="sm"
              variant={isEditing ? "secondary" : "default"}
              onClick={() => {
                setIsEditing((prev) => !prev);
                setMessage("");
                setError("");
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="rounded-2xl border border-orange-100/70 bg-white/95 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Update Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Ensure your details are accurate for enrollments and invoices.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                    {errors.name && (
                      <p className="text-xs font-medium text-rose-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName">Username</Label>
                    <Input
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                    {errors.userName && (
                      <p className="text-xs font-medium text-rose-600">
                        {errors.userName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3 text-xs text-muted-foreground">
                  Email, phone, and grade updates are managed by the institute.
                </div>

                {message && (
                  <p className="text-xs font-semibold text-emerald-600">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="text-xs font-semibold text-rose-600">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {message && (
                <p className="text-xs font-semibold text-emerald-600">
                  {message}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Username
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student?.userName || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student?.name || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 break-all">
                    {student?.email || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student?.phone || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Grade
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student?.grade || "Not set"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(student?.dob)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Branch
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {student?.branch || "Main"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white/70 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Joined
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatDate(student?.createdAt)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default StudentProfile;
