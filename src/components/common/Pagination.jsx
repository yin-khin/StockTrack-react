import React, { useMemo } from "react";

const Pagination = ({
  page = 1,
  totalPages = 1,
  onChange,
  maxButtons = 5,
  className = "",
}) => {
  const pages = useMemo(() => {
    if (totalPages <= 1) return [];
    const max = Math.max(3, maxButtons);
    const half = Math.floor(max / 2);

    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);

    const list = [];
    for (let p = start; p <= end; p++) list.push(p);
    return list;
  }, [page, totalPages, maxButtons]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => onChange?.(Math.max(page - 1, 1))}
        disabled={page <= 1}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        ថយក្រោយ
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onChange?.(1)}
            className={`px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              page === 1
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange?.(p)}
          className={`px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
            page === p
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">…</span>
          )}
          <button
            onClick={() => onChange?.(totalPages)}
            className={`px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
              page === totalPages
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onChange?.(Math.min(page + 1, totalPages))}
        disabled={page >= totalPages}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        ទៅមុខ
      </button>
    </div>
  );
};

export default Pagination;
