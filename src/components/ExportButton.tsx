"use client";

import { useSearchParams } from "next/navigation";
import { exportBuyersToCsv } from "@/actions/buyer";
import { useState } from "react";

export default function ExportButton() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    // Get all search parameters from the URL
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    // Call the server action with the search parameters
    const csvString = await exportBuyersToCsv(searchParamsObject);

    // Create a Blob and a temporary download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `buyer_leads_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        inline-flex items-center justify-center
        px-5 py-2.5
        text-sm font-medium
        border rounded-md
        shadow-sm
        transition-colors duration-200 ease-in-out
        ${
          isExporting
            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-indigo-600 text-white border-transparent hover:bg-indigo-700"
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      `}
    >
      {isExporting ? (
        <>
          <svg
            className="animate-spin h-4 w-4 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Exporting...
        </>
      ) : (
        "Export CSV"
      )}
    </button>
  );
}
