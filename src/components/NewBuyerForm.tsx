"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createBuyer } from "@/actions/buyer";
import { z } from "zod";

const CityEnum = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const PropertyTypeEnum = ["Apartment", "Villa", "Plot", "Office", "Retail"];
const BhkEnum = ["1", "2", "3", "4", "Studio"];
const PurposeEnum = ["Buy", "Rent"];
const TimelineEnum = ["0-3m", "3-6m", ">6m", "Exploring"];
const SourceEnum = ["Website", "Referral", "Walk-in", "Call", "Other"];

type FormState = {
  message: string;
  errors?: z.ZodIssue[];
};

const initialState: FormState = {
  message: "",
  errors: [],
};

export default function NewBuyerForm() {
  const [state, formAction] = useActionState(createBuyer, initialState);
  const [formData, setFormData] = useState({
    propertyType: "Apartment",
    bhk: "1",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form action={formAction} className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      {state.errors && state.errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Validation Error!</strong>
          <ul className="mt-2 list-disc list-inside">
            {state.errors.map((err, index) => (
              <li key={index}>**{err.path.join(".")}**: {err.message}</li>
            ))}
          </ul>
        </div>
      )}
      {state.message && (
        <div className={`py-2 px-4 rounded ${state.message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The form fields remain the same. I've only included a couple for brevity. Make sure to update your component with all the input fields from Step 10. */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="fullName" name="fullName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-[cyan]" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" id="phone" name="phone" required className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
          <input type="email" id="email" name="email" className="mt-1  text-[cyan] block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <select id="city" name="city" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm">
            {CityEnum.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
          <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm">
            {PropertyTypeEnum.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        {(formData.propertyType === "Apartment" || formData.propertyType === "Villa") && (
          <div>
            <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">BHK</label>
            <select id="bhk" name="bhk" value={formData.bhk} onChange={handleInputChange} required className="mt-1  text-[cyan] block w-full rounded-md border-gray-300 shadow-sm">
              {BhkEnum.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
          <select id="purpose" name="purpose" className="mt-1 block w-full text-[cyan] rounded-md border-gray-300 shadow-sm">
            {PurposeEnum.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">Timeline</label>
          <select id="timeline" name="timeline" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm">
            {TimelineEnum.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
          <select id="source" name="source" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm">
            {SourceEnum.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">Min Budget (INR)</label>
          <input type="number" id="budgetMin" name="budgetMin" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">Max Budget (INR)</label>
          <input type="number" id="budgetMax" name="budgetMax" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" id="tags" name="tags" className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Hot Lead, Investor, Family" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea id="notes" name="notes" rows={3} className="mt-1 text-[cyan] block w-full rounded-md border-gray-300 shadow-sm"></textarea>
        </div>
      </div>
      <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Create Lead
      </button>
    </form>
  );
}