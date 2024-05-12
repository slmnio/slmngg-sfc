import sharp from "sharp";
import fp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { cleanID } from "./action-utils/action-utils.js";


const heldPromises = [];
function getHeldPromise(parts) {
    return heldPromises[parts.join("-")];
}
function setHeldPromise(parts, promise) {
    heldPromises[parts.join("-")] = promise;
}
async function heldPromise(parts, promise) {
    if (getHeldPromise(parts)) {
        console.log("[image] promise held", parts);
        return getHeldPromise(parts);
    }
    setHeldPromise(parts, promise);
    return getHeldPromise(parts);
}

function getPath(filename, size) {
    return path.join(import.meta.dirname, "..", "images", size, filename);
}

async function getImage(filename, size) {
    try {
        let filePath = getPath(filename, size);
        await fp.access(filePath, fs.constants.R_OK);
        return filePath;
    } catch (e) {
        return null;
    }
}
async function getOrWaitForDownload(url, filename, size) {
    let p = getHeldPromise(["download", url, size, filename]);
    if (p) {
        console.log("[image] downloading in other promise, waiting for it");
        await p;
    }
    return getImage(filename, size);
}

async function downloadImage(url, filename, size) {
    console.log("[image|downloading]", url, filename, size);
    return await heldPromise(["download", url, size, filename], new Promise((resolve, reject) => {
        const pathName = getPath(filename, size);
        const file = fs.createWriteStream(pathName);

        function error(err) {
            console.error(`[image] file error for ${filename} ${err.code} ${err.message}`);
            fs.unlink(pathName, function(err) {
                if (err) {
                    console.error(`[image] file error for ${filename} unlink FAILED`, err);
                } else {
                    console.error(`[image] file error for ${filename} unlinked`);
                }
            });
            reject(err);
        }

        https.get(url, res => {
            if (![200].includes(res.statusCode)) return error({ code: res.statusCode, message: res.statusMessage });
            res.pipe(file);
            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", err => error(err));
    }));
}

async function ensureFolder(folderName) {
    let data = await getImage("", folderName);
    // console.log(data);
    if (!data) {
        console.log("[image]", `making new folder ${folderName}`);
        try {
            fs.mkdirSync(getPath("", folderName));
        } catch (e) {
            // if directory was made between the too calls
            if (e.code === "EEXIST") return null;
            console.error(e);
        }
    }
}

async function resizeImage(filename, sizeText, sizeData) {
    // console.log("resize", filename, sizeText);
    return heldPromise(["resize", sizeText, filename], (async () => {
        let origFilePath = getPath(filename, "orig");
        let resizedFilePath = getPath(filename, sizeText);
        await ensureFolder(sizeText);
        // let sizeInfo = getSizeInfo(sizeText);
        // if (!sizeInfo) return null;

        try {
            return await sharp(origFilePath).resize(sizeData).toFile(resizedFilePath);
        } catch (e) {
            console.error("Resize image error", e, origFilePath, sizeData);
            if (e.code === "EEXIST") {
                return await getImage(filename, sizeText);
            }
            return null;
        }
    })());
}

function getFilename(url) {
    let parts = url.split("/");
    let originalFilename = parts[parts.length - 1];
    let [strippedName, args] = originalFilename.split("?");
    originalFilename = strippedName;
    const dots = originalFilename.split(".");
    const originalFileType = dots[dots.length - 1]; // last . (now works with .svg.png)
    return parts[4].substring(0, 45) + "." + originalFileType; // specific to airtable urls, shorten to 45 chars TODO: This is a temporary fix, we should do it properly
}

/***
 *
 * @returns {Promise<string>} localFilePath - local file path to a stored image
 */
async function fullGetURL(attachment, sizeText, sizeData) {
    let { _autoFilename: filename, url } = attachment;

    let previouslyStoredImage = await getImage(filename, sizeText);
    if (previouslyStoredImage) return previouslyStoredImage;
    console.log("[image|fg] no stored image, creating it");

    // download if needed
    // will always need an orig copy regardless
    let storedOrig = await getImage(filename, "orig");
    if (!storedOrig) {
        await downloadImage(url, filename, "orig");
        storedOrig = await getImage(filename, "orig");
        console.log("[image|fg] downloaded orig copy");
    }

    if (sizeText === "orig") return storedOrig;
    // resize if needed
    await resizeImage(filename, sizeText, sizeData);
    console.log("[image|fg] resized image");
    return await getImage(filename, sizeText);
}

export default ({ app, cors, Cache }) => {

    ensureFolder("").then(() => console.log("[images] images folder ensured"));
    ensureFolder("orig").then(() => console.log("[images] orig folder ensured"));

    async function handleImageRequests(req, res) {

        try {
            if (req.query.url && !req.query.id) {
                return res.status(400).send("Requests must now send their attachment ID to receive a response");
            } else if (!req.query.id) {
                return res.status(400).send("Required parameter 'id' is missing");
            }

            let att = Cache.getAttachment(req.query.id);
            if (!att) return res.status(404).send("Could not find attachment data");

            let airtableURL = att.url;
            let filename = att._autoFilename;

            let size = "orig";
            let sizeData = {};
            let mode, num;
            if (req.query.width)  { mode = "width";  num = parseInt(req.query.width);  }
            if (req.query.height) { mode = "height"; num = parseInt(req.query.height); }
            if (req.query.square) { mode = "square"; num = parseInt(req.query.square); }

            if (!mode && req.query.size) {
                if (req.query.size === "orig") {
                    size = "orig";
                } else {
                    if (req.query.size.indexOf("-") === -1) return res.status(400).send("Size needs to be correct format {mode}-{val}");
                    const [sizeMode, sizeVal] = req.query.size.split("-");

                    if (sizeMode === "w") mode = "width";
                    if (sizeMode === "h") mode = "height";
                    if (sizeMode === "s") mode = "square";
                    num = parseInt(sizeVal);
                }
            }

            if (num > 3000) return res.status(400).send("Image too large");

            if (mode === "width") {
                size = "w-" + num;
                sizeData = { width: num };
            }
            if (mode === "height") {
                size = "h-" + num;
                sizeData = { height: num };
            }
            if (mode === "square") {
                size = "s-" + num;
                sizeData = {
                    width: num,
                    height: num,
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                };
            }

            if (["image/svg+xml", "image/gif"].includes(att.type)) {
                // Don't attempt to rescale these images
                size = "orig";
            }


            let imagePath = await getImage(filename, size);

            if (imagePath) {
                // already cached
                return res.sendFile(imagePath);
            }

            // not already cached
            console.log("[image]", `no file for ${filename} (${att.filename}) @ ${size}`);

            if (!airtableURL) return res.status(404).send("No URL available for this image");

            // first download or retrieve to orig/
            let orig = await getOrWaitForDownload(airtableURL, filename, "orig");

            if (!orig) {
                // original version isn't cached, download that first
                const t = Date.now();
                console.log("[image]", `downloading ${filename} (${att.filename}) @ orig...`);
                await downloadImage(airtableURL, filename, "orig");
                console.log("[image]", `downloaded ${filename} (${att.filename}) @ orig in ${Date.now() - t}ms`);
                orig = await getImage(filename, "orig");
                if (size === "orig") return res.sendFile(orig);
            }

            // resize time!
            // console.log("[image]", `resizing ${originalFilename} @ ${size}`);
            const t = Date.now();

            await resizeImage(filename, size, sizeData);
            let resizedImagePath = await getImage(filename, size);

            console.log("[image]", `resized ${filename} (${att.filename}) @ ${size} in ${Date.now() - t}ms`);

            if (resizedImagePath) return res.sendFile(resizedImagePath);

        } catch (e) {
            console.error("Image error", e);
            return res.status(400).send(e.message);
        }
        res.status(400).send("An error occurred");
    }
    app.get("/image", cors(), handleImageRequests);
    app.get("/image.:fileFormat", cors(), handleImageRequests); // ignoring requested file format here

    async function handleThemeRequests(req, res) {
        try {
            let t = new Date();
            if (!req.query.id) {
                return res.status(404).send("No theme ID requested");
            }
            let size = parseInt(req.query.size) || 500;
            let padding = Math.floor(size * ((req.query.padding || 5) / 100));

            if (size > 3000) return res.status(400).send("Requested image too large");


            let theme = await Cache.get(req.query.id);
            let logo = await Cache.getAttachment(theme.default_logo?.[0]?.id);

            if (!logo) return res.status(400).send("No logo to use");
            let themeColor = (theme.color_logo_background || theme.color_theme || "#222222").trim();

            // background: logo background
            // centered logo
            // with ?padding around it

            let filePath = await fullGetURL(logo, "orig", null);

            let filename = themeColor.replace("#", "") + "_" + logo._autoFilename;
            let sizeText = `theme-${size}-${padding}`;
            let resizedFilePath = getPath(filename, sizeText);
            // console.log({ filePath, filename, sizeText, resizedFilePath });
            await ensureFolder(sizeText);

            let heldImage = await getImage(filename, sizeText);
            if (heldImage) {
                // console.log("[image|theme]", `theme using saved @${size} in ${Date.now() - t}ms`);
                return res.sendFile(heldImage);
            }

            let resizedLogo = await sharp(filePath).resize({
                width: size - padding,
                height: size - padding,
                fit: "contain",
                background: themeColor
            }).toBuffer();

            res.header("Content-Type", "image/png");

            let compositeThemeImage = sharp({
                create: {
                    width: size,
                    height: size,
                    channels: 3,
                    background: themeColor
                }
            }).composite([{ input: resizedLogo }]);


            compositeThemeImage.clone().png().toBuffer()
                .then(data => {
                    console.log("[image|theme]", `theme processed @${size} in ${Date.now() - t}ms`);
                    res.end(data);
                });

            return await compositeThemeImage.clone().toFile(resizedFilePath);

        } catch (e) {
            console.error("Theme image error", e);
        }
        res.status(400).send("An error occurred");


        // sharp(filePath)
        //     .flatten({ background: theme.color_logo_background })
        //     .toBuffer()
        //     .then(data => res.end(data));

    }
    app.get("/theme", handleThemeRequests);
    app.get("/theme.:fileFormat", handleThemeRequests);

    async function handleMatchRequests(req, res) {
        try {
            let id = req.query.id;
            if (!id) return res.status(404).send("No match ID requested");
            let size = parseInt(req.query.size) || 500;
            if (size > 3000) return res.status(400).send("Requested image too large");
            let width = Math.floor(size * (16 / 9));
            let halfWidth = Math.floor(width / 2);
            let padding = Math.floor(size * ((req.query.padding || 5) / 100));

            let match = await Cache.get(id);
            if (!match?.id) return res.status(400).send("No valid match data");

            if ((match.teams || []).length === 2) {
                // do 2 teams side by side
                const teamIDs = match.teams.map(tID => cleanID(tID));
                let teams = await Promise.all(teamIDs.map(async tID => {
                    let data = await Cache.get(tID);
                    if (data?.theme?.[0]) data.theme = await Cache.get(data.theme[0]);
                    // console.log(data, data.theme);
                    return data;
                }));

                if (!teams.every(t => t.theme?.default_logo)) {
                    console.log(match, teams);
                    return res.status(500).send("Not all teams have theme data");
                }

                let thumb = await sharp({ create: {
                    width: width,
                    height: size,
                    channels: 3,
                    background: "#222222"
                }});

                let logos = await Promise.all(teams.map(async team => {
                    const logo = await Cache.getAttachment(team.theme?.default_logo?.[0]?.id);
                    if (!logo) return null;
                    let filePath = await fullGetURL(logo, "orig", null);
                    let themeColor = (team.theme.color_logo_background || team.theme.color_theme || "#222222").trim();

                    let resizedLogo = await sharp(filePath).resize({
                        width: halfWidth - padding,
                        height: size - padding,
                        fit: "contain",
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }).toBuffer();

                    return await sharp({ create: { width: halfWidth, height: size, channels: 4, background: themeColor }})
                        .composite([{ input: resizedLogo }]).png().toBuffer();
                }));

                if (logos.filter(Boolean).length < 2) {
                    return res.status(500).send("Team theme error");
                }

                let eventLogo;

                if (match.event) {
                    try {
                        let event = await Cache.get(match?.event?.[0]);
                        let eventTheme = event?.theme?.length ? await Cache.get(event?.theme?.[0]) : null;
                        const logo = await Cache.getAttachment(eventTheme?.default_logo?.[0]?.id);
                        if (!logo) return null;
                        let eventLogoFilePath = await fullGetURL(logo, "orig", null);
                        eventLogo = await sharp(eventLogoFilePath).resize({
                            height: Math.floor(size * 0.20),
                            width: Math.floor(size * 0.25),
                            fit: "contain",
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        }).png().toBuffer();
                    } catch (e) {
                        eventLogo = null;
                    }
                }

                thumb.composite([
                    ...logos.map((shp, i) => ({
                        input: shp,
                        left: i * halfWidth,
                        top: 0
                    })),
                    eventLogo ?
                        {
                            input: eventLogo,
                            top: Math.floor(size * 0.77),
                            left: Math.floor(halfWidth - (Math.floor(size * 0.25) / 2)),
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        } : {}
                ]);

                let thumbBuffer = await thumb.png().toBuffer();
                return res.header("Content-Type", "image/png").send(thumbBuffer);


            } else {
                // do event only
                if (!match.event) return res.status(400).send("No event data");
                let event = await Cache.get(match.event[0]);
                if (event.theme) event.theme = await Cache.get(event.theme[0]);
                if (!event.theme?.id) return res.status(400).send("No event theme data");
                let themeColor = event.theme.color_logo_background || event.theme.color_theme || "#222222";

                let filePath = await fullGetURL(event.theme.default_logo[0], "orig", null);

                let resizedLogo = await sharp(filePath).resize({
                    width: width - padding,
                    height: size - padding,
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }).toBuffer();

                let thumb = await sharp({ create: {
                    width: width,
                    height: size,
                    channels: 3,
                    background: themeColor
                }}).composite([
                    { input: resizedLogo }
                ]);
                let thumbBuffer = await thumb.png().toBuffer();
                return res.header("Content-Type", "image/png").send(thumbBuffer);
            }
        } catch (e) {
            console.error("Match image error", e);
        }
        res.status(400).send("An error occurred");
    }
    app.get("/match", handleMatchRequests);
    app.get("/match.:fileFormat", handleMatchRequests);

};
