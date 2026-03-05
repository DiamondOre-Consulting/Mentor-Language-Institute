import React from "react";

const RouteSkeleton = () => (
  <div className="mx-auto w-full max-w-6xl px-4 py-10">
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-48 rounded bg-slate-200" />
      <div className="h-10 w-2/3 rounded bg-slate-100" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  </div>
);

export default RouteSkeleton;
