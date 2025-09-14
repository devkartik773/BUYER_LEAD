import React from "react";

import { prisma } from "@/lib/prisma";
import EditBuyerForm from "@/components/EditBuyerForm";
import { format } from "date-fns";


type ViewBuyerPageProps = {
  params: {
    id: string;
  };
};

export default async function ViewBuyerPage({ params }: ViewBuyerPageProps) {
  const buyer = await prisma.buyer.findUnique({
    where: { id: params.id },
  });

  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: params.id },
    orderBy: { changedAt: "desc" },
    take: 5,
  });

  if (!buyer) {
    return <div className="text-center text-red-500 mt-10">Buyer lead not found.</div>;
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Edit Buyer Lead</h1>
      {/* We're passing the full buyer object and history to the form */}
      <EditBuyerForm buyer={buyer} history={history} />

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Lead History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No history available for this lead.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((entry) => (
              <li key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Changed on {format(new Date(entry.changedAt), 'MMM dd, yyyy HH:mm')}
                </p>
                {/* The corrected history rendering section */}
                {Object.entries(entry.diff as Record<string, any>).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
                    const typedValue = value as { old: string | number; new: string | number; };
                    return (
                      <div key={key} className="text-sm">
                        <span className="font-semibold">{key}: </span>
                        <span className="text-red-500 line-through">{typedValue.old !== null ? typedValue.old : 'N/A'}</span> → <span className="text-green-500">{typedValue.new !== null ? typedValue.new : 'N/A'}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}