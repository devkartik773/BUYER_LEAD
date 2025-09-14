"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

const CityEnum = ["All", "Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const PropertyTypeEnum = ["All", "Apartment", "Villa", "Plot", "Office", "Retail"];
const StatusEnum = ["All", "New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"];
const TimelineEnum = ["All", "0-3m", "3-6m", ">6m", "Exploring"];

export default function SearchAndFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset page on search/filter change
    router.replace(`/buyers?${params.toString()}`);
  }, [debouncedSearchQuery, searchParams, router]);

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    params.delete("page");
    router.replace(`/buyers?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 text-[black]">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          onChange={(e) => handleFilterChange("city", e.target.value)}
          value={searchParams.get("city") || "All"}
          className="rounded-md border-gray-300 shadow-sm"
        >
          {CityEnum.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
        <select
          onChange={(e) => handleFilterChange("propertyType", e.target.value)}
          value={searchParams.get("propertyType") || "All"}
          className="rounded-md border-gray-300 shadow-sm"
        >
          {PropertyTypeEnum.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select
          onChange={(e) => handleFilterChange("status", e.target.value)}
          value={searchParams.get("status") || "All"}
          className="rounded-md border-gray-300 shadow-sm"
        >
          {StatusEnum.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <select
          onChange={(e) => handleFilterChange("timeline", e.target.value)}
          value={searchParams.get("timeline") || "All"}
          className="rounded-md border-gray-300 shadow-sm"
        >
          {TimelineEnum.map(timeline => <option key={timeline} value={timeline}>{timeline}</option>)}
        </select>
      </div>
    </div>
  );
}