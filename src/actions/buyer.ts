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

export async function exportBuyersToCsv(searchParams: Record<string, string | string[] | undefined>) {
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
        // Ensure searchParams.search is a string before calling toLowerCase()
        const searchTerm = Array.isArray(searchParams.search)
            ? searchParams.search[0].toLowerCase() // Use the first item if it's an array
            : searchParams.search.toLowerCase(); // Use the string directly

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
