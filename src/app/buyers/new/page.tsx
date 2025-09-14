import NewBuyerForm from "@/components/NewBuyerForm";
import Link from "next/link";
import React from "react";

export default function NewBuyerPage() {
  return (
    <>
      <header className="bg-white shadow-md p-4">
        <nav className="container mx-auto flex items-center justify-between">
          <Link href="/buyers" className="text-2xl font-bold text-indigo-600">
            Lead Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/buyers" className="text-gray-600 hover:text-indigo-600 transition-colors">
              View All Leads
            </Link>
            <Link href="/buyers/import" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Import Leads
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-xl text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[red] mb-2">Create a New Buyer Lead</h1>
          <p className="text-lg text-[lightgreen]">
            Fill out the form below to capture a new potential buyer.
          </p>
        </div>
        <NewBuyerForm />
      </main>
    </>
  );
}