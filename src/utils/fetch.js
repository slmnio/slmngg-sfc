import store from "@/thing-store";
import { cleanID } from "@/utils/content-utils";

export async function fetchThing (id) {
    try {
        id = cleanID(id);
        let data = await fetch(`http://localhost:8901/thing/${id}`).then(res => res.json());
        const debug = true;
        if (data.error) {
            console.error(data.message);
            data = { id: id, __fetch_failed: true };
        }
        // console.log("[thing]", "Saving to store", id);
        store.commit("push", {
            id,
            data
        });
        // return store.state.things.get(id);
        // console.log(store.state.things);
        return store.state.things.find(t => t.id === id);
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

export function resolveID(obj) {
    if (!obj) return null;
    if (typeof obj === "string") return (obj);
    if (typeof obj === "object") {
        if (obj.length && obj[0]) return (obj[0]);
        return (obj.id);
    }
    console.warn("fall through", obj);
    return null;
}
export async function resolveThing(thing) {
    return await getThing(resolveID(thing));
}
export async function resolveThings(things) {
    return await Promise.all(things.map(thing => resolveThing(thing)));
}

export async function getThing(id) {
    id = cleanID(id);
    const findIndex = store.state.things.findIndex(t => t.id === id);
    if (findIndex !== -1) {
        return store.state.things[findIndex];
    }
    console.log("getting from api", id);
    const d = await fetchThing(id);
    // console.log(d);
    return d;

    // if (store.state.things.has(id)) {
    //     console.log("[thing]", "Getting from store", id, store.state.things.get(id));
    //     return store.state.things.get(id);
    // }
    // console.log("[thing]", "Getting from API", id);
    // return await fetchThing(id);
}
export async function getThings(ids) {
    return ids.map(id => getThing(id));
}
