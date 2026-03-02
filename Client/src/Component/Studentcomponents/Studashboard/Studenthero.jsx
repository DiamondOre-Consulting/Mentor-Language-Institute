import React, { useEffect, useState } from "react";
import studenthero from "..//..//..//assets/studenthero.png";
import translate from "translate";

const Studenthero = ({ naming }) => {
  const [index, setIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const languages = ["en", "hi", "ko", "ar", "fr", "es", "de", "it"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % languages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const translateName = async () => {
      const studentName = naming?.name || "Student";
      const language = languages[index];
      try {
        const [welcome, name] = await Promise.all([
          translate("Welcome", { from: "en", to: language }),
          translate(studentName, { from: "en", to: language }),
        ]);
        setUserName(`${welcome} ${name}`);
      } catch {
        setUserName(`Welcome ${studentName}`);
      }
    };
    translateName();
  }, [index, naming]);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "1.5rem",
        marginBottom: "2.5rem",
        background:
          "radial-gradient(ellipse 90% 70% at 0% 0%, rgba(251,146,60,0.22), transparent 60%), " +
          "radial-gradient(ellipse 70% 60% at 100% 100%, rgba(251,191,36,0.14), transparent 60%), " +
          "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fffbf0 100%)",
        boxShadow:
          "0 8px 40px -12px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
        border: "1px solid rgba(254,215,170,0.5)",
      }}
    >
      {/* Decorative background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "rgba(251,191,36,0.12)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "30%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(249,115,22,0.08)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "grid",
          alignItems: "center",
          gap: "2rem",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          position: "relative",
          zIndex: 1,
          gridTemplateColumns: "1fr auto",
        }}
      >
        {/* Left: text content */}
        <div data-sr="fade-up">
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.25)",
                borderRadius: "999px",
                padding: "0.3rem 0.875rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#c2410c",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#f97316",
                  display: "inline-block",
                  animation: "pulseSoft 1.8s ease infinite",
                }}
              />
              Student Portal
            </span>
          </div>

          {/* Dynamic welcome heading */}
          {userName && (
            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                color: "#0f172a",
                minHeight: "clamp(2.5rem, 6vw, 4rem)",
                margin: "0 0 1rem",
              }}
            >
              {userName} 👋
            </h1>
          )}

          {/* Subtext */}
          <p
            style={{
              fontSize: "clamp(0.875rem, 2vw, 1.05rem)",
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: "480px",
              margin: "0 0 1.75rem",
            }}
          >
            Mentor Institute — your pathway to proficiency. Unlock fluency and
            broaden horizons with expert guidance.
          </p>

          {/* Floating stat chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.625rem",
              marginBottom: "1.75rem",
            }}
          >
            {[
              { icon: "🌍", label: "10+ Languages" },
              { icon: "👨‍🏫", label: "Expert Mentors" },
              { icon: "📅", label: "Flexible Schedule" },
            ].map((chip, idx) => (
              <span
                key={chip.label}
                data-sr="zoom"
                data-sr-delay={100 + (idx * 50)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "#fff",
                  border: "1px solid #fed7aa",
                  borderRadius: "999px",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#92400e",
                  boxShadow: "0 2px 8px -4px rgba(249,115,22,0.2)",
                }}
              >
                {chip.icon} {chip.label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div data-sr="fade-right" data-sr-delay="300" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a
              href="#courses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.7rem 1.5rem",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,115,22,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.35)"; }}
            >
              Explore Courses
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a
              href="#enrolledcourse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.7rem 1.5rem",
                borderRadius: "999px",
                background: "#fff",
                border: "1.5px solid #fed7aa",
                color: "#c2410c",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.borderColor = "#f97316"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#fed7aa"; }}
            >
              My Enrolled Courses
            </a>
          </div>
        </div>

        {/* Right: hero image */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: "-16px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <img
              src={studenthero}
              className="animate-float"
              style={{
                position: "relative",
                zIndex: 10,
                width: "clamp(200px, 28vw, 300px)",
                maxWidth: "100%",
                filter: "drop-shadow(0 12px 30px rgba(249,115,22,0.2))",
              }}
              alt="Student dashboard hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Studenthero;
