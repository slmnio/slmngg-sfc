import { getDataServerAddress } from "@/utils/fetch";

export function bg(url) {
    if (!url) return {};
    return { backgroundImage: `url(${url.replaceAll("(", "%28").replaceAll(")", "%29")})` };
}

export function getNewURL(attachment, size) {
    if (!attachment?.fileExtension) {
        console.warn("Unknown data", JSON.stringify(attachment));
    }
    if (!size) {
        console.warn("[Image Utils]", "No size set for attachment", attachment);
        size = "orig";
    }
    const dataServer = getDataServerAddress();
    return `${dataServer}/image.${attachment.fileExtension}?id=${attachment.id}&size=${size}`;
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
    return getNewURL(imageAttachment, size);
}

export function resizedImage(theme, keys, size) {
    return bg(resizedImageNoWrap(theme, keys, size));
}

export function resizedAttachment(attachments, size) {
    return getNewURL(attachments, size);
}
