import React from "react";

export const CardSkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 h-4 w-3/5 rounded bg-slate-200" />
        <div className="mb-4 h-3 w-2/5 rounded bg-slate-100" />
        <div className="mb-4 h-6 w-20 rounded-full bg-slate-100" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 6 }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: cols }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div className="h-3 w-20 rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {Array.from({ length: cols }).map((__, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-3 w-full rounded bg-slate-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
