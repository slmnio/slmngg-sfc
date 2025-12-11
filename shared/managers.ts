export class MapObject {
    public data: { key: string; data: string }[] = [];

    constructor(text: string | undefined) {
        if (!text) return;
        this.data = (text || "").split("\n").map(e => {
            const [key, data] = e.split("=");
            return { key, data };
        }).filter(e => e.key);
    }
    get(key: string) {
        const data = this.data.find(n => n.key === key)?.data;
        if (data === "false") return false;
        if (data === "true") return true;
        return data;
    }
    getString(key: string) {
        return this.data.find(n => n.key === key)?.data;
    }
    push(key: string, data: any) {
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
}
