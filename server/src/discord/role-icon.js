const { getAttachment } = require("../cache");
const { getResizedImagePath } = require("../images");

async function getDiscordIcon(theme) {
    const image = (theme.small_logo || theme.default_logo)?.[0];
    if (!image.id) return null;
    const attachment = getAttachment(image.id);
    const imagePath = await getResizedImagePath(attachment.url, attachment._autoFilename, "s-128", {
        width: 128,
        height: 128,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
    return imagePath;
}

module.exports = { getDiscordIcon };
