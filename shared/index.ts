import type { AnyAirtableID, CleanAirtableID, DirtyAirtableID } from "./types.js";

export function cleanID(id: AnyAirtableID | null | undefined | { id: AnyAirtableID }): CleanAirtableID | null {
    if (!id) return null;
    if (typeof id !== "string") {
        if (id?.id) return id.id;
        return null;
    }
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

export function cleanTypedID<IDType extends string>(id: (IDType | DirtyAirtableID)): IDType {
    if (id?.startsWith("rec") && id.length === 17) return id.slice(3) as IDType;
    return id as IDType;
}

// Allow a passthrough type for now - almost everything will be a dirty ID and the distinction to clean needs to be
export function dirtyID<IDType extends string>(id: IDType) {
    if (id?.length === 14) return "rec" + id as IDType;
    return id as IDType;
}

export * from "./types.js";
export * from "./managers.js";
