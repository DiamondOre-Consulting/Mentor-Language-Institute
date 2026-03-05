import React from "react";

const EmptyState = ({
  title = "No data yet",
  description = "We could not find any records here.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
        <svg
          className="h-6 w-6 text-orange-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.3 3.6L2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
