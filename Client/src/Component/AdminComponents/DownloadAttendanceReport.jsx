import React, { useState, useEffect } from "react";
import { useApi } from "../../api/useApi";
import * as XLSX from "xlsx";
import { MdFileDownload } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const DownloadAttendanceReport = () => {
  const date = new Date();
  const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
  const currentYear = date.getFullYear();
  const navigate = useNavigate();
  const { get } = useApi();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [excelData, setExcelData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const fetchAllcourses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: "/admin-confi/all-classes",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        setAllCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchAllcourses();
  }, [navigate]);

  const getAttendanceReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: `/admin-confi/download-attendance-report?month=${selectedMonth}&year=${selectedYear}&courseId=${selectedCourseId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer",
      }).unwrap();

      const data = new Uint8Array(response.data);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setExcelData(jsonData);
    } catch (error) {
      console.error("Error loading Excel:", error);
    }
  };

  useEffect(() => {
    getAttendanceReport();
  }, [selectedMonth, selectedYear, selectedCourseId]);

  const processData = () => {
    let sections = [];
    let currentSection = null;
    function getMonthName(monthNumber) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const index = parseInt(monthNumber, 10) - 1;
      return index >= 0 && index < 12 ? monthNames[index] : "Invalid month";
    }

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const firstCol = row[`Attendance Report - ${getMonthName(selectedMonth)} ${selectedYear}`];
      const secondCol = row["__EMPTY"];
      const thirdCol = row["__EMPTY_1"];

      const isTitleRow = firstCol && secondCol === "" && thirdCol === "";
      const isHeaderRow = firstCol === "Sno." && secondCol === "Name";

      if (isTitleRow) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: firstCol, headers: [], rows: [] };
      } else if (isHeaderRow && currentSection) {
        currentSection.headers = Object.values(row);
      } else if (currentSection && currentSection.headers.length > 0) {
        currentSection.rows.push(Object.values(row));
      }
    }

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const sections = processData();

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: `/admin-confi/download-attendance-report?month=${selectedMonth}&year=${selectedYear}&courseId=${selectedCourseId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }).unwrap();

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance_Report_${selectedMonth}_${selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white to-orange-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Attendance Report</h1>
            <p className="mt-1 text-sm text-slate-600">Filter by month, year, and course, then export Excel instantly.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth} className="min-w-[140px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <option>Select Month</option>
              <option value={"01"}>January</option>
              <option value={"02"}>February</option>
              <option value={"03"}>March</option>
              <option value={"04"}>April</option>
              <option value={"05"}>May</option>
              <option value={"06"}>June</option>
              <option value={"07"}>July</option>
              <option value={"08"}>August</option>
              <option value={"09"}>September</option>
              <option value={"10"}>October</option>
              <option value={"11"}>November</option>
              <option value={"12"}>December</option>
            </select>

            <select onChange={(e) => setSelectedYear(parseInt(e.target.value))} value={selectedYear} className="min-w-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <option>Select Year</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>

            <select onChange={(e) => setSelectedCourseId(e.target.value)} value={selectedCourseId} className="min-w-[170px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="">All Courses</option>
              {allCourses?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c?.classTitle}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleDownload()}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <MdFileDownload className="text-xl" /> Download
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-700 sm:text-xl">
        Attendance Report - {selectedMonth}/{selectedYear}
      </h2>

      {sections.length > 0 ? (
        sections.map((section, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-800 sm:text-lg">{section.title}</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-[760px] w-full border-collapse text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {section.headers.map((header, i) => (
                      <th key={i} className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.length === 0 ? (
                    <tr>
                      <td colSpan={section.headers.length} className="py-3 text-center text-slate-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    section.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-slate-200 px-3 py-2 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No data found in Excel sheet.
        </div>
      )}
    </div>
  );
};

export default DownloadAttendanceReport;


