import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Suspense } from "react";
import SearchAndFilters from "@/components/SearchAndFilters";
import ExportButton from "@/components/ExportButton"; // Corrected import

// Define the props for our page component, which will receive URL search parameters
type BuyersPageProps = {
    searchParams: {
        page?: string;
        city?: string;
        propertyType?: string;
        status?: string;
        timeline?: string;
        search?: string;
    };
};

const PAGE_SIZE = 10;

// This component will fetch the data based on the URL parameters
async function BuyersTable({ searchParams }: BuyersPageProps) {
    const page = parseInt(searchParams.page || "1");
    const skip = (page - 1) * PAGE_SIZE;

    // Build the WHERE clause for our Prisma query based on filters and search
    const where: any = {};
    if (searchParams.city) {
        where.city = searchParams.city;
    }
    if (searchParams.propertyType) {
        where.propertyType = searchParams.propertyType;
    }
    if (searchParams.status) {
        where.status = searchParams.status;
    }
    if (searchParams.timeline) {
        where.timeline = searchParams.timeline;
    }
    if (searchParams.search) {
        const searchTerm = searchParams.search.toLowerCase();
        where.OR = [
            {
                fullName: {
                    contains: searchTerm,
                },
            },
            {
                phone: {
                    contains: searchTerm,
                },
            },
            {
                email: {
                    contains: searchTerm,
                },
            },
        ];
    }

    // Fetch the leads and the total count for pagination
    const [buyers, totalBuyers] = await prisma.$transaction([
        prisma.buyer.findMany({
            where,
            take: PAGE_SIZE,
            skip,
            orderBy: {
                updatedAt: "desc",
            },
        }),
        prisma.buyer.count({ where }),
    ]);

    const totalPages = Math.ceil(totalBuyers / PAGE_SIZE);

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {buyers.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                No buyer leads found.
                            </td>
                        </tr>
                    ) : (
                        buyers.map((buyer) => (
                            <tr key={buyer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{buyer.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.propertyType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {buyer.budgetMin !== null && buyer.budgetMax !== null ? `${buyer.budgetMin}–${buyer.budgetMax}` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.timeline}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{buyer.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(buyer.updatedAt), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/buyers/${buyer.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        View / Edit
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4">
                {/* Previous Page Link */}
                <Link
                    href={
                        (() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", (page - 1).toString());
                            return `/buyers?${params.toString()}`;
                        })()
                    }
                    className={`px-3 py-1 border rounded-md ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                    Previous
                </Link>

                {/* Current Page Info */}
                <span>
                    Page {page} of {totalPages}
                </span>

                {/* Next Page Link */}
                <Link
                    href={
                        (() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", (page + 1).toString());
                            return `/buyers?${params.toString()}`;
                        })()
                    }
                    className={`px-3 py-1 border rounded-md ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                    Next
                </Link>
            </div>
        </div>
    );
}

// The main page component that will render the search/filter form and the table
export default function BuyersPage({ searchParams }: BuyersPageProps) {
    return (
        <main className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Buyer Leads</h1>
                <div className="flex space-x-4">
                    <ExportButton /> {/* The corrected component */}
                    <Link href="/buyers/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        + New Lead
                    </Link>
                </div>
            </div>
            <Suspense fallback={<div>Loading filters...</div>}>
                <SearchAndFilters />
            </Suspense>

            <Suspense fallback={<div>Loading leads...</div>}>
                <BuyersTable searchParams={searchParams} />
            </Suspense>
        </main>
    );
}