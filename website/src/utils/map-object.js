export class MapObject {
    constructor(text, arrays = false) {
        this.arrays = arrays;
        this.data = (text || "").split("\n").map(e => {
            const [key, data] = e.split("=");
            return { key, data: arrays ? (data || "").split(",") : data };
        }).filter(e => e.key);
    }

    get(key) {
        const data = this.data.find(n => n.key === key)?.data;
        if (data === "false") return false;
        if (data === "true") return true;
        return data;
    }

    push(key, data) {
        if (!key) return;
        const _item = this.data.find(i => i.key === key);
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
        const data = [];
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
