import type { AirtableRecord, AnyAirtableID, CleanAirtableID, DirtyAirtableID } from "./types.js";

export function cleanID(id: AnyAirtableID | null | undefined | { id: AnyAirtableID }): CleanAirtableID | null {
    if (!id) return null;
    if (typeof id !== "string") {
        if (id?.id) return id.id;
        return null;
    }
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

export function keyDeAirtable(key: string) {
    return key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase();
}

type DeAirtableFlags = "allowEmptyValues";
type DeAirtableOptions = undefined | {
    [Flag in DeAirtableFlags]?: boolean;
};

export function deAirtable(obj: AirtableRecord["fields"], options: DeAirtableOptions = {}) {
    const data: Partial<AirtableRecord["fields"]> = {};
    Object.entries(obj).forEach(([key, val]) => {
        if (key === "__tableName") return data[key as any] = val;
        data[keyDeAirtable(key)] = val;
    });
    Object.entries(data).forEach(([key, val]) => {
        if (!options?.allowEmptyValues) {
            if (typeof val === "object" && (Array.isArray(val) ? val?.length === 0 : true)) {
                if (val instanceof Date) {
                    data[key] = val.getTime();
                } else {
                    console.log("[Action deAirtable] Skipping", key, val);
                    delete data[key];
                }
            }
        }
        if (key === "limited_players" && typeof data[key] === "object") {
            // reflatten
            data[key] = (data[key] as string[]).map(limitedPlayer => Object.entries(limitedPlayer).map(([k, v]) => `${k.replaceAll("_"," ")}=${v}`)).join("\n");
        }
    });
    data.id = obj.id;
    return data;
}


export function deAirtableRecord(record: Partial<AirtableRecord>, options: DeAirtableOptions = {}) {
    // console.log("deAirtableRecord", record.id, record.fields);
    if (!record?.fields) return null;
    return {
        ...deAirtable(record.fields, options),
        id: record.id
    };
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

export function multiple(num: number, singular: string, plural = singular + "s") {
    if (num === 1) return num + " " + singular;
    return num + " " + plural;
}


export const slmnggAttachments : { [k: string]: string[] } = {
    "Events": ["broadcast_texture"],
    "Players": ["headshot"],
    "Themes": ["default_logo", "default_wordmark", "small_logo", "other_images", "logo_on_dark", "logo_on_light", "logo_on_theme", "wordmark_on_dark", "wordmark_on_light", "wordmark_on_theme"],
    "Broadcasts": ["break_image", "background"],
    "News": ["header", "thumbnail"],
    "Map Data": ["image", "big_image", "video", "audio"],
    "Maps": ["image", "big_image"],
    "Log Files": ["log_file"],
    "Heroes": ["icon", "main_image", "recolor_base", "recolor_layers", "alternate_set_image", "pick_audio", "ban_audio", "video", "background", "wordmark", "positive_image", "negative_image"],
    "Ad Reads": ["audio", "image"],
    "Tracks": ["file"],
    "Teams": ["icon", "images"],
    "GFX": ["image"],
    "Trivia": ["question_content", "reveal_content"]
};

export * from "./types.js";
export * from "./managers.js";
