class MapHandler {
    constructor({ map, ids, create_function }) {
        // console.log("Map constructor", {map, ids});
        this.map = new MapObject(map, true);
        this.ids = new MapObject(ids);
        this.create_function = create_function;
    }
    get itemsToCreate() {
        return this.map.data.filter(mapItem => !this.ids.data.find(setItem => setItem.key === mapItem.key && setItem.data));
    }
    async createMissingItems(toCreate) {
        let data = await Promise.all(await ((toCreate || this.itemsToCreate).map(item => this.create_function(item))));
        data.forEach(item => {
            this.ids.push(item.key, item.item.id);
        });
        return data;
    }
    get combined() {
        return this.map.data.map(m => {
            return { ...m, id: this.ids.get(m.key) };
        });
    }
}

class MapObject {
    constructor(text, arrays=false) {
        this.arrays = arrays;
        this.data = (text || "").split("\n").map(e => {
            let [key, data] = e.split("=");
            return { key, data: arrays ? (data || "").split(",") : data };
        }).filter(e => e.key);
    }
    get(key) {
        let data = this.data.find(n => n.key === key)?.data;
        if (data === "false") return false;
        if (data === "true") return true;
        return data;
    }
    push(key, data) {
        if (!key) return;
        let _item = this.data.find(i => i.key === key);
        if (_item) {
            _item.data = data;
        } else {
            this.data.push({ key, data });
        }
    }
    get textMap() {
        // console.log("TEXT MAP", this.data);
        return this.data.filter(e => e.key).map(e => [e.key, e.data].join("=")).join("\n");
    }
    get uniqueData() {
        let data = [];
        this.data.forEach(item => {
            if (this.arrays) {
                item.data.forEach(d => {
                    if (data.indexOf(d) === -1) data.push(d);
                });
            } else {
                if (data.indexOf(item.data) === -1) data.push(item.data);
            }
        });
        return data;
    }
}

module.exports = { MapHandler, MapObject };
