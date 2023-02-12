import { getDataServerAddress } from "@/utils/fetch";

export function bg(url) {
    if (!url) return {};
    return { backgroundImage: `url(${url.replaceAll("(", "%28").replaceAll(")", "%29")})` };
}

function getFileEnding(url, mimeType) {
    if (mimeType) {
        return mimeType.split("/").pop();
    }
    return url.split("/").pop().split(".").pop();
}

export function getImageURL(airtableURL, size, mimeType) {
    mimeType = mimeType && mimeType.split("+")?.[0];
    if (!size) {
        console.warn("[Image Utils]", `No size set for ${airtableURL}`);
        size = "orig";
    }
    const dataServer = getDataServerAddress();
    return `${dataServer}/image.${getFileEnding(airtableURL, mimeType)}?size=${size}${mimeType ? `&type=${mimeType}` : ""}&url=${airtableURL.replace("?", "&")}`;
}

export function getAirtableURL(attachment) {
    if (attachment?.url) return attachment.url;
    return attachment?.[0]?.url || null;
}

function keyedImageAttachments(theme, keys) {
    const urls = keys.map(key => theme[key]?.[0]).filter(s => s?.url);
    if (urls.length) return urls[0];
    return null;
}

export function resizedImageNoWrap(theme, keys, size) {
    if (!theme) return null;
    const imageAttachment = keyedImageAttachments(theme, keys);
    if (!imageAttachment) return null;
    return getImageURL(getAirtableURL(imageAttachment), size, imageAttachment.type);
}

export function resizedImage(theme, keys, size) {
    return bg(resizedImageNoWrap(theme, keys, size));
}

export function resizedAttachment(attachment, size) {
    return getImageURL(getAirtableURL(attachment), size || "orig", attachment.type);
}
