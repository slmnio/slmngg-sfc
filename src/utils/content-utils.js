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

export function cleanID (id) {
    // console.log(">id", id);
    if (!id) return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
