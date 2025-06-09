import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { MdFileDownload } from "react-icons/md";

const DownloadAttendanceReport = () => {
  const date = new Date();
  const currentMonth = String(date.getMonth() + 1).padStart(2, "0");
  const currentYear = date.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [excelData, setExcelData] = useState([]);

  const getAttendanceReport = async () => {
    try {
      const response = await axios.get(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/download-attendance-report?month=${selectedMonth}&year=${selectedYear}`,
        {
          responseType: "arraybuffer",
        }
      );

      console.log(response);

      const data = new Uint8Array(response.data);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setExcelData(jsonData);
    } catch (error) {
      console.error("Error loading Excel:", error);
    }
  };

  console.log(excelData);

  useEffect(() => {
    getAttendanceReport();
  }, [selectedMonth, selectedYear]);

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

      // Convert "01" → 1, then subtract 1 for 0-based index
      const index = parseInt(monthNumber, 10) - 1;

      // Validate index
      if (index >= 0 && index < 12) {
        return monthNames[index];
      } else {
        return "Invalid month";
      }
    }

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const firstCol =
        row[
          `Attendance Report - ${getMonthName(selectedMonth)} ${selectedYear}`
        ];
      const secondCol = row["__EMPTY"];
      const thirdCol = row["__EMPTY_1"];

      const isTitleRow = firstCol && secondCol === "" && thirdCol === "";
      const isHeaderRow = firstCol === "Sno." && secondCol === "Name";

      if (isTitleRow) {
        // Push the previous section if any
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start a new section
        currentSection = {
          title: firstCol,
          headers: [],
          rows: [],
        };
      } else if (isHeaderRow && currentSection) {
        // Save header row
        currentSection.headers = Object.values(row);
      } else if (currentSection && currentSection.headers.length > 0) {
        // Add data row
        currentSection.rows.push(Object.values(row));
      }
    }

    // Push the last section if exists
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = processData();

  console.log(sections);

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/download-attendance-report?month=${selectedMonth}&year=${selectedYear}`,
        {
          responseType: "blob",
        }
      );

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance_Report_${selectedMonth}_${selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-center  justify-between">
        <div className="flex mb-4">
          <select
            onChange={(e) => setSelectedMonth(e.target.value)}
            value={selectedMonth}
          >
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

          <select
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            value={selectedYear}
          >
            <option>Select Year</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
          </select>
        </div>
        <MdFileDownload
          className="text-4xl animate-bounce cursor-pointer"
          onClick={() => handleDownload()}
        />
      </div>

      <h1 className="text-xl font-bold mb-4">
        Attendance Report - {selectedMonth}/{selectedYear}
      </h1>

      {sections.length > 0 ? (
        sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {section.headers.map((header, i) => (
                    <th
                      key={i}
                      className={`border border-gray-300 px-2 py-1 ${
                        i === 0 ? "min-w-20" : i === 2 ? "min-w-40" : "w-full"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={section.headers.length}
                      className="text-center py-2 text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  section.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`border border-gray-300 px-2 w-40 py-1 ${
                            cellIndex === 0
                              ? "min-w-30 text-center"
                              : cellIndex === 2
                              ? "min-w-40 text-center"
                              : "w-full"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No data found in Excel sheet.</p>
      )}
    </div>
  );
};

export default DownloadAttendanceReport;
