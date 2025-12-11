import type { AnyAirtableID, ResolvedData } from "shared";
import * as Cache from "../cache.js";

export async function get<IDType extends AnyAirtableID>(id: IDType) : Promise<ResolvedData<IDType>> {
    return await Cache.get(id) as ResolvedData<IDType>;
}
