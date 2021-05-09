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

export function cssImage(cssVar, theme, keys, minSize = 30, useResizer = true) {
    const url = multiImage(theme, keys, minSize, useResizer);
    const css = {};
    if (url) {
        css[cssVar] = `url(${url})`;
    }
    return css;
}

export function multiImage(theme, keys, minSize = 30, useResizer = true) {
    let url;
    if (useResizer) {
        url = keys.map(key => resizedImage(theme, key, minSize)).find(u => !!u);
    } else {
        url = keys.map(key => getImage(theme[key])).find(u => !!u);
    }
    return url || null;
}

export function getMatchContext(match) {
    const text = [];
    let out = "";

    if (match?.event?.short) {
        out = match?.event?.short + ": ";
    }

    // sub_event: round
    // week_text: round
    // week
    //

    text.push(match?.week_text || "");
    text.push(match?.round || "");
    // text.push(match?.sub_event || ""); // round > sub_event
    text.push((match?.week && (!match?.week_text) && `Week ${match?.week}`) || ""); // basically regular season
    return out + text.filter((t, i, a) => !!t && a.indexOf(t) === i).join(" · ");
}
