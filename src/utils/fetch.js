import store from "@/thing-store";
import { cleanID } from "@/utils/content-utils";

export async function fetchThing (id) {
    try {
        id = cleanID(id);
        const data = await fetch(`http://localhost:8901/thing/${id}`).then(res => res.json());
        console.log("[thing]", "Saving to store", id);
        store.commit("push", {
            id,
            data
        });
        return store.state.things.get(id);
    } catch (e) {
        console.error(e);
        return null;
    }
}
export async function fetchThings (ids) {
    try {
        ids = ids.map(id => cleanID(id)).join(",");

        return await fetch(`http://localhost:8901/things/${ids}`).then(res => res.json());
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function resolveThing(obj) {
    if (typeof obj === "string") return getThing(obj);
    if (typeof obj === "object") {
        if (obj.length && obj[0]) return getThing(obj[0]);
        return getThing(obj.id);
    }
    console.warn("fall through", obj);
    return null;
}

export async function getThing(id) {
    id = cleanID(id);
    if (store.state.things.has(id)) {
        console.log("[thing]", "Getting from store", id, store.state.things.get(id));
        return store.state.things.get(id);
    }
    console.log("[thing]", "Getting from API", id);
    return await fetchThing(id);
}
export async function getThings(ids) {
    return ids.map(id => getThing(id));
}
