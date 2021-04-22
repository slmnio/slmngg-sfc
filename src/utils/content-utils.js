export function getImage (i) {
    // console.log(i);
    if (!i) return null;
    return i[0].url;
}

export function url (page, record) {
    if (record && record.id) record.id = cleanID(record.id);
    return `/${page}/${record.id}`;
}

export function image (theme, key) {
    return `url(${getImage(theme[key])})`;
}

export function resizedImage(theme, key, minSize = 30) {
    if (!theme || !theme[key] || !theme[key][0]) return "";
    const image = theme[key][0];
    const candidates = Object.values(image.thumbnails)
        .sort((a, b) => a.height - b.height)
        .filter((thumb) => thumb.height >= minSize && thumb.width >= minSize);
    if (candidates.length) return candidates[0].url; // get smallest that fits minSize
    return image.url;
}

export function cleanID (id) {
    // console.log(">id", id);
    if (!id) return null;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
