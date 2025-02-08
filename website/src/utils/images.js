import { getDataServerAddress } from "@/utils/fetch";

export function bg(url) {
    if (!url) return {};
    return { backgroundImage: `url(${url.replaceAll("(", "%28").replaceAll(")", "%29")})` };
}

export function getNewURL(attachment, size) {
    if (attachment.custom_url) return attachment.custom_url;
    if (!attachment) {
        console.warn("No attachment");
        return "";
    }
    if (!attachment?.fileExtension) {
        console.warn("Unknown data", JSON.stringify(attachment));
    }
    if (!size) {
        console.warn("[Image Utils]", "No size set for attachment", attachment);
        size = "orig";
    }
    const dataServer = getDataServerAddress();
    // console.log(attachment);
    return `${dataServer}/image.${attachment.fileExtension}?id=${attachment.id}&size=${size}`;
}

function keyedImageAttachments(theme, keys) {
    const attachments = keys.map(key => theme[key]?.[0]).filter(s => s?.id);
    if (attachments.length) return attachments[0];
    return null;
}

export function resizedImageNoWrap(theme, keys, size) {
    // console.log("resized image", { theme, keys, size });
    if (!theme) return null;
    const imageAttachment = keyedImageAttachments(theme, keys);
    if (!imageAttachment) return null;
    return getNewURL(imageAttachment, size);
}

export function resizedImage(theme, keys, size) {
    return bg(resizedImageNoWrap(theme, keys, size));
}

export function resizedAttachment(attachment, size) {
    return getNewURL(attachment, size);
}
