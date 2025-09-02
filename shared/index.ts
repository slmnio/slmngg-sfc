import {AnyAirtableID, CleanAirtableID} from "./types";

export function cleanID(id: AnyAirtableID | null): CleanAirtableID | null {
    if (!id) return null;
    if (id?.id) return id.id;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

export * from "./types";
