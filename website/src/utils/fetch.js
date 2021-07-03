import store from "@/thing-store";
import { cleanID } from "@/utils/content-utils";

async function addToBuffer(id) {
    return store.commit("addToRequestBuffer", id);
}

export async function queueThing(id) {
    if (!store.getters.thing(id)) {
        store.commit("push", {
            id, data: { __loading: true }
        });
    }
    return addToBuffer(id);
}
export async function queueThings(ids) {
    return ids.map(id => queueThing(id));
}

export async function fetchThing (id) {
    if (!store.getters.thing(id)) {
        store.commit("push", {
            id, data: { __loading: true }
        });
    }
    return addToBuffer(id);

    // eslint-disable-next-line no-unreachable
    // try {
    //     id = cleanID(id);
    //
    //     store.commit("push", {
    //         id, data: { __loading: true }
    //     });
    //
    //     let data = await fetch(`${process.env.NODE_ENV === "development" ? "http://localslmn:8901" : "https://data.slmn.gg"}/thing/${id}`).then(res => res.json());
    //     if (data.error) {
    //         console.error(data.message);
    //         data = { id: id, __fetch_failed: true };
    //     }
    //     // console.log("[thing]", "Saving to store", id);
    //     store.commit("push", {
    //         id,
    //         data
    //     });
    //     // return store.state.things.get(id);
    //     // console.log(store.state.things);
    //     return store.state.things.find(t => t.id === id);
    // } catch (e) {
    //     console.error(e);
    //     return null;
    // }
}
export async function fetchThings (ids) {
    console.log("[socket] fetching multiple ", ids.length);
    try {
        ids = ids.map(id => cleanID(id));

        ids.forEach(id => store.commit("push", {
            id, data: { __loading: true }
        }));

        const data = await fetch(`${process.env.NODE_ENV === "development" ? "http://localslmn:8901" : "https://data.slmn.gg"}/things/${ids.join(",")}`).then(res => res.json());

        if (data.error) {
            console.error(data.message);
        }

        data.forEach(item => {
            store.commit("push", {
                id: cleanID(item.id),
                data: item
            });
            if (cleanID(item.id) !== item.__id) {
                console.log("[custom update]", item.__id, item.id);
                store.commit("push", {
                    id: item.__id,
                    data: item
                });
            }
        });
        return data;
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
    if (!things || !things.length) return [];
    return await getThings(things.map(t => resolveID(t)));
    // return await Promise.all(things.map(thing => resolveThing(thing)));
}

export async function getThing(id) {
    id = cleanID(id);
    if (!id) return null;
    // TODO: some sort of queue system so it doesn't try to XHR things that are currently pending
    const findIndex = store.state.things.findIndex(t => t.id === id);
    if (findIndex !== -1) {
        return store.state.things[findIndex];
    }
    // console.log("[socket]", "resolving thing", id);
    // console.log(d);
    return await fetchThing(id);

    // if (store.state.things.has(id)) {
    //     console.log("[thing]", "Getting from store", id, store.state.things.get(id));
    //     return store.state.things.get(id);
    // }
    // console.log("[thing]", "Getting from API", id);
    // return await fetchThing(id);
}
export async function getThings(ids) {
    console.log("[socket]", `resolving ${ids.length} things`);
    await fetchThings(ids);
    return ids.map(id => getThing(id));
}

export async function getAndWait(id) {

}
