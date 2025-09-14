"use client";

import { useActionState } from "react";
import { importBuyersFromCsv } from "@/actions/buyer";
import { z } from "zod";

const initialState = {
  message: "",
  errors: [],
  validationErrors: [],
};

type FormState = {
  message: string;
  errors: z.ZodIssue[];  // Not optional, but initialState has it empty array
  validationErrors: { row: number; errors: z.ZodIssue[] }[];  // Same
};

export default function ImportPage() {
  const [state, formAction] = useActionState(importBuyersFromCsv, initialState);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Import Buyer Leads (CSV)</h1>
      <form action={formAction} className="max-w-xl mx-auto space-y-4">
        {state.message && (
          <div className={`py-2 px-4 rounded ${state.message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {state.message}
          </div>
        )}
        {state.errors && state.errors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <ul className="mt-2 list-disc list-inside">
              {state.errors.map((err, index: number) => (
                <li key={index}>**{err.path.join(".")}**: {err.message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg">
          <label htmlFor="csvFile" className="text-lg font-medium text-gray-700">Choose CSV file</label>
          <p className="text-sm text-gray-500 mb-2">Max 200 rows</p>
          <input
            type="file"
            id="csvFile"
            name="csvFile"
            accept=".csv"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Import
        </button>
      </form>
      
      {/* Display a table of row-by-row validation errors */}
     {(state.validationErrors ?? []).length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Import Errors</h2>
          <p className="mb-4">The following rows failed to import due to validation errors:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {(state.validationErrors ?? []).map((rowError) => (
                  <tr key={rowError.row}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rowError.row}</td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500">
                      <ul className="list-disc list-inside">
                        {rowError.errors.map((err, index) => (
                          <li key={index}>{err.path.join('.')} - {err.message}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}