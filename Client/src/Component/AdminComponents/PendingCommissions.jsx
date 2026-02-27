import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const PendingCommissions = () => {
  const navigate = useNavigate();
  const { get, post, del } = useApi();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteAllPopup, setShowDeleteAllPopup] = useState(false);

  const fetchCommissions = async (refresh = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: `/admin-confi/pending-commissions${refresh ? "?refresh=true" : ""}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        const rows = response.data || [];
        setCommissions(rows);
      }
    } catch (error) {
      console.error("Error fetching pending commissions:", error);
      setMessage("Failed to load pending commissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions(true);
  }, []);

  const filteredCommissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return commissions;
    return commissions.filter((item) => {
      const teacherName = item?.teacherId?.name || "";
      const teacherPhone = item?.teacherId?.phone || "";
      const classTitle = item?.classId?.classTitle || "";
      const month = item?.monthName || "";
      const year = item?.year || "";
      return [teacherName, teacherPhone, classTitle, month, year]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [commissions, searchQuery]);

  const handleUpdate = async (commissionId) => {
    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await post({
        url: `/admin-confi/update-monthly-commission/${commissionId}`,
        data: {
          paid: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setMessage("Commission updated.");
        setCommissions((prev) =>
          prev.filter((item) => item._id !== commissionId)
        );
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      setMessage("Failed to update commission.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteAllPopup = () => {
    setShowDeleteAllPopup(true);
  };

  const closeDeleteAllPopup = () => {
    setShowDeleteAllPopup(false);
  };

  const deleteAllCommissions = async () => {
    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await del({
        url: "/admin-confi/delete-all-commissions?confirm=true",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setCommissions([]);
        setShowDeleteAllPopup(false);
        setMessage(response.data?.message || "All commissions deleted.");
      }
    } catch (error) {
      console.error("Error deleting commissions:", error);
      setMessage("Failed to delete all commissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white to-orange-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Pending Commissions
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review pending teacher commissions and mark them as paid.
            </p>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search teacher or course..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                style={{ paddingLeft: "3rem" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchCommissions(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openDeleteAllPopup}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            >
              Delete All
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Month
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Classes
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Offline Commission
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Online Commission
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Total Commission
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommissions.map((item) => (
                <tr key={item._id} className="hover:bg-orange-50/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">
                      {item?.teacherId?.name || "Unknown"}
                    </div>
                      <div className="text-xs text-slate-500">
                        {item?.teacherId?.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item?.classId?.classTitle || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.monthName} {item.year}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.classesTaken}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.offlineCommission ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.onlineCommission ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.commission ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600">
                        Pending
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdate(item._id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Mark Paid
                      </button>
                    </td>
                </tr>
              ))}
              {filteredCommissions.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={9}
                  >
                    No pending commissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ClipLoader color="#FFA500" loading={loading} css={override} size={70} />
        </div>
      )}

      {showDeleteAllPopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-md text-center">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={closeDeleteAllPopup}
                  type="button"
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <svg className="mx-auto h-16 w-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-2 mt-4 text-lg font-semibold text-slate-700">
                Delete All Commissions
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                This will permanently remove all commission records. This action cannot be undone.
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={deleteAllCommissions}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={closeDeleteAllPopup}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PendingCommissions;
