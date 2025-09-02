export type CleanAirtableID = string;
export type DirtyAirtableID = `rec${CleanAirtableID}`;
export type AnyAirtableID = DirtyAirtableID | CleanAirtableID;
