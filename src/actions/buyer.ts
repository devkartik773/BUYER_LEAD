// "use server";


// import { prisma } from "@/lib/prisma";
// import { buyerSchema } from "@/schemas/buyer";
// import { z } from "zod";
// import { revalidatePath } from "next/cache";
// import csv from "csv-parser";
// import { Readable } from "stream";

// type FormState = {
//     message: string;
//     errors?: z.ZodIssue[];
// };

// // create buyer action

// export async function createBuyer(prevState: FormState, formData: FormData): Promise<FormState> {
//     // 1. Get user ID from session/auth (we'll implement this later)
//     // For now, we'll use a placeholder user ID.
//     const ownerId = "clsdq2w70000010v0j1h1x80"; // Placeholder UUID

//     // 2. Extract data from FormData
//     const parsedData = {
//         fullName: formData.get("fullName"),
//         email: formData.get("email"),
//         phone: formData.get("phone"),
//         city: formData.get("city"),
//         propertyType: formData.get("propertyType"),
//         bhk: formData.get("bhk"),
//         purpose: formData.get("purpose"),
//         budgetMin: formData.get("budgetMin"),
//         budgetMax: formData.get("budgetMax"),
//         timeline: formData.get("timeline"),
//         source: formData.get("source"),
//         notes: formData.get("notes"),
//         tags: formData.get("tags"),
//     };

//     // 3. Server-side validation with Zod
//     const validatedFields = buyerSchema.safeParse(parsedData);

//     // If validation fails, return the errors
//     if (!validatedFields.success) {
//         return {
//             message: "Validation failed.",
//             errors: validatedFields.error.issues,
//         };
//     }

//     const {
//         fullName, email, phone, city, propertyType, bhk, purpose, budgetMin,
//         budgetMax, timeline, source, notes, tags
//     } = validatedFields.data;

//     try {
//         // 4. Create the new buyer record in a Prisma transaction
//         await prisma.$transaction(async (tx) => {
//             const newBuyer = await tx.buyer.create({
//                 data: {
//                     fullName,
//                     email: email || null, // Ensure optional fields are null if empty
//                     phone,
//                     city,
//                     propertyType,
//                     bhk: bhk || null,
//                     purpose,
//                     budgetMin: budgetMin || null,
//                     budgetMax: budgetMax || null,
//                     timeline,
//                     source,
//                     notes: notes || null,
//                     tags: tags || "",
//                     ownerId,
//                 },
//             });

//             // 5. Create the initial buyer history record
//             await tx.buyerHistory.create({
//                 data: {
//                     buyerId: newBuyer.id,
//                     changedBy: ownerId,
//                     diff: {
//                         action: "create",
//                         fields: newBuyer,
//                     },
//                 },
//             });
//         });

//         // 6. Invalidate the cache for the buyer list page
//         revalidatePath("/buyers");

//         return { message: "Buyer lead created successfully." };
//     } catch (error) {
//         console.error("Database Error:", error);
//         return {
//             message: "Failed to create buyer lead.",
//         };
//     }
// }

// // update buyer action

// export async function updateBuyer(
//     buyerId: string,
//     updatedAt: Date,
//     prevState: FormState,
//     formData: FormData
// ): Promise<FormState> {
//     // 1. Get user ID from session/auth (we'll implement this later)
//     const ownerId = "clsdq2w70000010v0j1h1x80"; // Placeholder UUID

//     // 2. Extract data from FormData
//     const parsedData = {
//         fullName: formData.get("fullName"),
//         email: formData.get("email"),
//         phone: formData.get("phone"),
//         city: formData.get("city"),
//         propertyType: formData.get("propertyType"),
//         bhk: formData.get("bhk"),
//         purpose: formData.get("purpose"),
//         budgetMin: formData.get("budgetMin"),
//         budgetMax: formData.get("budgetMax"),
//         timeline: formData.get("timeline"),
//         source: formData.get("source"),
//         status: formData.get("status"),
//         notes: formData.get("notes"),
//         tags: formData.get("tags"),
//     };

//     // 3. Server-side validation with Zod
//     const validatedFields = buyerSchema.safeParse(parsedData);

//     if (!validatedFields.success) {
//         return {
//             message: "Validation failed.",
//             errors: validatedFields.error.issues,
//         };
//     }

//     const newBuyerData = validatedFields.data;

//     try {
//         // Find the old buyer data to compare changes
//         const oldBuyer = await prisma.buyer.findUnique({
//             where: { id: buyerId },
//         });

//         if (!oldBuyer) {
//             return { message: "Record not found." };
//         }

//         // 4. Ownership & Concurrency Check
//         // We compare the provided updatedAt timestamp with the one in the database.
//         if (oldBuyer.updatedAt.getTime() > new Date(updatedAt).getTime()) {
//             return { message: "Record has been changed by another user. Please refresh." };
//         }

//         // Optional: Check if the user is the owner
//         if (oldBuyer.ownerId !== ownerId) {
//             return { message: "You can only edit your own leads." };
//         }

//         // 5. Update the buyer record and log history in a transaction
//         await prisma.$transaction(async (tx) => {
//             // Get a list of changed fields
//             const changedFields: { [key: string]: { old: any; new: any } } = {};
//             (Object.keys(newBuyerData) as (keyof typeof newBuyerData)[]).forEach((key) => {
//                 const oldValue = oldBuyer[key];
//                 const newValue = newBuyerData[key];

//                 if (key === 'tags') {
//                     // Tags is stored as a comma-separated string, compare it directly
//                     if (oldValue !== newValue) {
//                         changedFields[key] = { old: oldValue, new: newValue };
//                     }
//                 } else if (oldValue !== newValue) {
//                     changedFields[key] = { old: oldValue, new: newValue };
//                 }
//             });

//             // Only proceed if there are actual changes
//             if (Object.keys(changedFields).length > 0) {
//                 // Update the buyer record
//                 await tx.buyer.update({
//                     where: { id: buyerId },
//                     data: {
//                         ...newBuyerData,
//                         email: newBuyerData.email || null,
//                         bhk: newBuyerData.bhk || null,
//                         budgetMin: newBuyerData.budgetMin || null,
//                         budgetMax: newBuyerData.budgetMax || null,
//                         notes: newBuyerData.notes || null,
//                         tags: newBuyerData.tags || "",
//                     },
//                 });

//                 // Create a history entry with the changes
//                 await tx.buyerHistory.create({
//                     data: {
//                         buyerId: buyerId,
//                         changedBy: ownerId,
//                         diff: changedFields,
//                     },
//                 });
//             }
//         });

//         // Revalidate the pages
//         revalidatePath("/buyers");
//         revalidatePath(`/buyers/${buyerId}`);

//         return { message: "Buyer lead updated successfully." };
//     } catch (error) {
//         console.error("Database Error:", error);
//         return {
//             message: "Failed to update buyer lead.",
//         };
//     }
// }

// //  export csv action

// export async function exportBuyersToCsv(searchParams: any) {
//     // 1. Re-create the filter/search WHERE clause from the URL parameters
//     const where: any = {};
//     if (searchParams.city) {
//         where.city = searchParams.city;
//     }
//     if (searchParams.propertyType) {
//         where.propertyType = searchParams.propertyType;
//     }
//     if (searchParams.status) {
//         where.status = searchParams.status;
//     }
//     if (searchParams.timeline) {
//         where.timeline = searchParams.timeline;
//     }
//     if (searchParams.search) {
//         const searchTerm = searchParams.search.toLowerCase();
//         where.OR = [
//             {
//                 fullName: {
//                     contains: searchTerm,
//                 },
//             },
//             {
//                 phone: {
//                     contains: searchTerm,
//                 },
//             },
//             {
//                 email: {
//                     contains: searchTerm,
//                 },
//             },
//         ];
//     }

//     // 2. Fetch all buyers that match the filters
//     const buyers = await prisma.buyer.findMany({
//         where,
//         orderBy: {
//             updatedAt: "desc",
//         },
//     });

//     // 3. Define the CSV headers
//     const headers = [
//         "fullName", "email", "phone", "city", "propertyType", "bhk",
//         "purpose", "budgetMin", "budgetMax", "timeline", "source",
//         "notes", "tags", "status"
//     ];

//     // 4. Create the CSV data
//     const csvData = buyers.map(buyer => {
//         // Handle potential null values and format data for CSV
//         return [
//             `"${buyer.fullName}"`,
//             `"${buyer.email || ""}"`,
//             `"${buyer.phone}"`,
//             `"${buyer.city}"`,
//             `"${buyer.propertyType}"`,
//             `"${buyer.bhk || ""}"`,
//             `"${buyer.purpose}"`,
//             buyer.budgetMin || "",
//             buyer.budgetMax || "",
//             `"${buyer.timeline}"`,
//             `"${buyer.source}"`,
//             `"${buyer.notes || ""}"`,
//             `"${buyer.tags || ""}"`,
//             `"${buyer.status}"`,
//         ].join(",");
//     }).join("\n");

//     // 5. Combine headers and data
//     const csv = `${headers.join(",")}\n${csvData}`;

//     // 6. Return the CSV string
//     return csv;
// }

// // import buyer action

// const IMPORT_ROW_LIMIT = 200;

// export async function importBuyersFromCsv(prevState: any, formData: FormData): Promise<FormState> {
//     const file = formData.get("csvFile") as File;
//     const ownerId = "clsdq2w70000010v0j1h1x80"; // Placeholder UUID

//     if (!file || file.size === 0) {
//         return { message: "No file was uploaded.", errors: [{ path: ["csvFile"], message: "File is required." }], validationErrors: [] };
//     }

//     if (file.size > 2 * 1024 * 1024) { // Max 2MB
//         return { message: "File size exceeds limit.", errors: [{ path: ["csvFile"], message: "File must be under 2MB." }], validationErrors: [] };
//     }

//     const stream = Readable.from(Buffer.from(await file.arrayBuffer()));
//     const validLeads: z.infer<typeof buyerSchema>[] = [];
//     const validationErrors: { row: number; errors: z.ZodIssue[] }[] = [];
//     let rowNumber = 1;

//     // We'll use a promise to handle the stream-based parsing
//     await new Promise<void>((resolve, reject) => {
//         stream.pipe(csv()).on('data', (data) => {
//             if (rowNumber > IMPORT_ROW_LIMIT) {
//                 stream.destroy();
//                 return reject(new Error(`Import limit of ${IMPORT_ROW_LIMIT} rows exceeded.`));
//             }

//             // Format data to match our Zod schema's expectations
//             const formattedData = {
//                 ...data,
//                 budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
//                 budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
//             };

//             const result = buyerSchema.safeParse(formattedData);

//             if (result.success) {
//                 validLeads.push(result.data);
//             } else {
//                 validationErrors.push({ row: rowNumber, errors: result.error.issues });
//             }
//             rowNumber++;
//         }).on('end', () => {
//             resolve();
//         }).on('error', (error) => {
//             reject(error);
//         });
//     });

//     if (validationErrors.length > 0) {
//         return {
//             message: `Import failed: ${validationErrors.length} row(s) had errors.`,
//             errors: [],
//             validationErrors,
//         };
//     }

//     if (validLeads.length === 0) {
//         return { message: "No valid rows found in the CSV.", errors: [], validationErrors: [] };
//     }

//     try {
//         await prisma.$transaction(async (tx) => {
//             for (const lead of validLeads) {
//                 const newBuyer = await tx.buyer.create({
//                     data: {
//                         ...lead,
//                         email: lead.email || null,
//                         bhk: lead.bhk || null,
//                         notes: lead.notes || null,
//                         tags: lead.tags || "",
//                         ownerId,
//                     },
//                 });

//                 await tx.buyerHistory.create({
//                     data: {
//                         buyerId: newBuyer.id,
//                         changedBy: ownerId,
//                         diff: { action: "import" },
//                     },
//                 });
//             }
//         });

//         revalidatePath("/buyers");
//         return { message: `${validLeads.length} lead(s) imported successfully!`, errors: [], validationErrors: [] };
//     } catch (error) {
//         console.error("Database Error:", error);
//         return {
//             message: "Database import failed.",
//             errors: [],
//             validationErrors: [],
//         };
//     }
// }

"use server";

import { prisma } from "@/lib/prisma";
import { buyerSchema } from "@/schemas/buyer";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import csv from "csv-parser";
import { Readable } from "stream";

// ✅ UPDATED TYPE
type FormState = {
    message: string;
    errors?: z.ZodIssue[];
    validationErrors?: { row: number; errors: z.ZodIssue[] }[];
};

// ✅ NO CHANGE IN LOGIC BELOW
// ---------------------------

export async function createBuyer(prevState: FormState, formData: FormData): Promise<FormState> {
    const ownerId = "clsdq2w70000010v0j1h1x80";

    const parsedData = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        propertyType: formData.get("propertyType"),
        bhk: formData.get("bhk"),
        purpose: formData.get("purpose"),
        budgetMin: formData.get("budgetMin"),
        budgetMax: formData.get("budgetMax"),
        timeline: formData.get("timeline"),
        source: formData.get("source"),
        notes: formData.get("notes"),
        tags: formData.get("tags"),
    };

    const validatedFields = buyerSchema.safeParse(parsedData);

    if (!validatedFields.success) {
        return {
            message: "Validation failed.",
            errors: validatedFields.error.issues,
        };
    }

    const {
        fullName, email, phone, city, propertyType, bhk, purpose, budgetMin,
        budgetMax, timeline, source, notes, tags
    } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const newBuyer = await tx.buyer.create({
                data: {
                    fullName,
                    email: email || null,
                    phone,
                    city,
                    propertyType,
                    bhk: bhk || null,
                    purpose,
                    budgetMin: budgetMin || null,
                    budgetMax: budgetMax || null,
                    timeline,
                    source,
                    notes: notes || null,
                    tags: tags || "",
                    ownerId,
                },
            });

            await tx.buyerHistory.create({
                data: {
                    buyerId: newBuyer.id,
                    changedBy: ownerId,
                    diff: {
                        action: "create",
                        fields: newBuyer,
                    },
                },
            });
        });

        revalidatePath("/buyers");

        return { message: "Buyer lead created successfully." };
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Failed to create buyer lead.",
        };
    }
}

export async function updateBuyer(
    buyerId: string,
    updatedAt: Date,
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const ownerId = "clsdq2w70000010v0j1h1x80";

    const parsedData = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        propertyType: formData.get("propertyType"),
        bhk: formData.get("bhk"),
        purpose: formData.get("purpose"),
        budgetMin: formData.get("budgetMin"),
        budgetMax: formData.get("budgetMax"),
        timeline: formData.get("timeline"),
        source: formData.get("source"),
        status: formData.get("status"),
        notes: formData.get("notes"),
        tags: formData.get("tags"),
    };

    const validatedFields = buyerSchema.safeParse(parsedData);

    if (!validatedFields.success) {
        return {
            message: "Validation failed.",
            errors: validatedFields.error.issues,
        };
    }

    const newBuyerData = validatedFields.data;

    try {
        const oldBuyer = await prisma.buyer.findUnique({
            where: { id: buyerId },
        });

        if (!oldBuyer) {
            return { message: "Record not found." };
        }

        if (oldBuyer.updatedAt.getTime() > new Date(updatedAt).getTime()) {
            return { message: "Record has been changed by another user. Please refresh." };
        }

        if (oldBuyer.ownerId !== ownerId) {
            return { message: "You can only edit your own leads." };
        }

        await prisma.$transaction(async (tx) => {
            const changedFields: { [key: string]: { old: any; new: any } } = {};
            (Object.keys(newBuyerData) as (keyof typeof newBuyerData)[]).forEach((key) => {
                const oldValue = oldBuyer[key];
                const newValue = newBuyerData[key];

                if (key === 'tags') {
                    if (oldValue !== newValue) {
                        changedFields[key] = { old: oldValue, new: newValue };
                    }
                } else if (oldValue !== newValue) {
                    changedFields[key] = { old: oldValue, new: newValue };
                }
            });

            if (Object.keys(changedFields).length > 0) {
                await tx.buyer.update({
                    where: { id: buyerId },
                    data: {
                        ...newBuyerData,
                        email: newBuyerData.email || null,
                        bhk: newBuyerData.bhk || null,
                        budgetMin: newBuyerData.budgetMin || null,
                        budgetMax: newBuyerData.budgetMax || null,
                        notes: newBuyerData.notes || null,
                        tags: newBuyerData.tags || "",
                    },
                });

                await tx.buyerHistory.create({
                    data: {
                        buyerId: buyerId,
                        changedBy: ownerId,
                        diff: changedFields,
                    },
                });
            }
        });

        revalidatePath("/buyers");
        revalidatePath(`/buyers/${buyerId}`);

        return { message: "Buyer lead updated successfully." };
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Failed to update buyer lead.",
        };
    }
}

export async function exportBuyersToCsv(searchParams: any) {
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
            { fullName: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
            { email: { contains: searchTerm } },
        ];
    }

    const buyers = await prisma.buyer.findMany({
        where,
        orderBy: {
            updatedAt: "desc",
        },
    });

    const headers = [
        "fullName", "email", "phone", "city", "propertyType", "bhk",
        "purpose", "budgetMin", "budgetMax", "timeline", "source",
        "notes", "tags", "status"
    ];

    const csvData = buyers.map(buyer => {
        return [
            `"${buyer.fullName}"`,
            `"${buyer.email || ""}"`,
            `"${buyer.phone}"`,
            `"${buyer.city}"`,
            `"${buyer.propertyType}"`,
            `"${buyer.bhk || ""}"`,
            `"${buyer.purpose}"`,
            buyer.budgetMin || "",
            buyer.budgetMax || "",
            `"${buyer.timeline}"`,
            `"${buyer.source}"`,
            `"${buyer.notes || ""}"`,
            `"${buyer.tags || ""}"`,
            `"${buyer.status}"`,
        ].join(",");
    }).join("\n");

    const csv = `${headers.join(",")}\n${csvData}`;

    return csv;
}

// ✅ CSV IMPORT FUNCTION (unchanged logic, type now fixed)
const IMPORT_ROW_LIMIT = 200;

export async function importBuyersFromCsv(prevState: FormState, formData: FormData): Promise<FormState> {
    const file = formData.get("csvFile") as File;
    const ownerId = "clsdq2w70000010v0j1h1x80";

    if (!file || file.size === 0) {
        return {
            message: "No file was uploaded.",
            errors: [{ code: "custom", path: ["csvFile"], message: "File is required." }],
            validationErrors: [],
        };
    }

    if (file.size > 2 * 1024 * 1024) {
        return {
            message: "File size exceeds limit.",
            errors: [{ code: "custom", path: ["csvFile"], message: "File must be under 2MB." }],
            validationErrors: [],
        };
    }

    const stream = Readable.from(Buffer.from(await file.arrayBuffer()));
    const validLeads: z.infer<typeof buyerSchema>[] = [];
    const validationErrors: { row: number; errors: z.ZodIssue[] }[] = [];
    let rowNumber = 1;

    await new Promise<void>((resolve, reject) => {
        stream.pipe(csv()).on('data', (data) => {
            if (rowNumber > IMPORT_ROW_LIMIT) {
                stream.destroy();
                return reject(new Error(`Import limit of ${IMPORT_ROW_LIMIT} rows exceeded.`));
            }

            const formattedData = {
                ...data,
                budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
                budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
            };

            const result = buyerSchema.safeParse(formattedData);

            if (result.success) {
                validLeads.push(result.data);
            } else {
                validationErrors.push({ row: rowNumber, errors: result.error.issues });
            }
            rowNumber++;
        }).on('end', () => {
            resolve();
        }).on('error', (error) => {
            reject(error);
        });
    });

    if (validationErrors.length > 0) {
        return {
            message: `Import failed: ${validationErrors.length} row(s) had errors.`,
            errors: [],
            validationErrors,
        };
    }

    if (validLeads.length === 0) {
        return {
            message: "No valid rows found in the CSV.",
            errors: [],
            validationErrors: [],
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const lead of validLeads) {
                const newBuyer = await tx.buyer.create({
                    data: {
                        ...lead,
                        email: lead.email || null,
                        bhk: lead.bhk || null,
                        notes: lead.notes || null,
                        tags: lead.tags || "",
                        budgetMin: lead.budgetMin === "" ? null : lead.budgetMin,
                        budgetMax: lead.budgetMax === "" ? null : lead.budgetMax,
                        ownerId,
                    },
                });

                await tx.buyerHistory.create({
                    data: {
                        buyerId: newBuyer.id,
                        changedBy: ownerId,
                        diff: { action: "import" },
                    },
                });
            }
        });

        revalidatePath("/buyers");
        return {
            message: `${validLeads.length} lead(s) imported successfully!`,
            errors: [],
            validationErrors: [],
        };
    } catch (error) {
        console.error("Database Error:", error);
        return {
            message: "Database import failed.",
            errors: [],
            validationErrors: [],
        };
    }
}
