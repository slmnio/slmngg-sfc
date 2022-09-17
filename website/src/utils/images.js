import { getDataServerAddress } from "@/utils/fetch";

export function bg(url) {
    if (!url) return {};
    return { backgroundImage: `url(${url})` };
}

export function getImageURL(airtableURL, size) {
    if (!size) {
        console.warn("[Image Utils]", `No size set for ${airtableURL}`);
        size = "orig";
    }
    const dataServer = getDataServerAddress();
    return `${dataServer}/image?size=${size}&url=${airtableURL}`;
}

export function getAirtableURL(attachment) {
    if (attachment?.url) return attachment.url;
    return attachment?.[0]?.url || null;
}

function keyedImage(theme, keys) {
    const urls = keys.map(key => getAirtableURL(theme[key])).filter(s => s);
    if (urls.length) return urls[0];
    return null;
}

export function resizedImageNoWrap(theme, keys, size) {
    if (!theme) return null;
    const imageURL = keyedImage(theme, keys);
    if (!imageURL) return null;
    return getImageURL(imageURL, size);
}

export function resizedImage(theme, keys, size) {
    return bg(resizedImageNoWrap(theme, keys, size));
}

export function resizedAttachment(attachment, size) {
    return getImageURL(getAirtableURL(attachment), size || "orig");
}
