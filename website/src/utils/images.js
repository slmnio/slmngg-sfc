import { getDataServerAddress } from "@/utils/fetch";

export function bg(url) { return { backgroundImage: `url(${url})` }; }

export function getImageURL(airtableURL, size) {
    const dataServer = getDataServerAddress();
    return `${dataServer}/image?size=${size}&url=${airtableURL}`;
}

function getAirtableURL(attachment) {
    return attachment?.[0]?.url || null;
}

function keyedImage(theme, keys) {
    const urls = keys.map(key => getAirtableURL(theme[key])).filter(s => s);
    if (urls.length) return urls[0];
    return null;
}

export function resizedImage(theme, keys, size) {
    const imageURL = keyedImage(theme, keys);
    if (!imageURL) return null;
    return bg(getImageURL(imageURL, size));
}
