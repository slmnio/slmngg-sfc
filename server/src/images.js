import sharp from "sharp";
import fp from "fs/promises";
import fs from "fs";
import path from "path";
import https from "https";

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
    return path.join(path.resolve("."), "images", size, filename);
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
    return await heldPromise(["download", url, size, filename], new Promise((resolve, reject) => {
        const pathName = getPath(filename, size);
        const file = fs.createWriteStream(pathName);
        https.get(url, res => {
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
        }).on("error", err => {
            console.error(`[image] file error for ${filename} ${err.code} ${err.message}`);
            fs.unlink(pathName);
            reject(err);
        });
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
    const originalFilename = parts[parts.length - 1];
    const dots = originalFilename.split(".");
    const originalFileType = dots[dots.length - 1]; // last . (now works with .svg.png)
    return parts[4] + "." + originalFileType; // specific to airtable urls
}

/***
 *
 * @returns {Promise<string>} localFilePath - local file path to a stored image
 */
async function fullGetURL(url, sizeText, sizeData) {
    let filename = getFilename(url);
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

    ensureFolder("orig").then(r => console.log("[images] orig folder ensured"));

    async function handleImageRequests(req, res) {
        try {
            if (!req.query.url) {
                return res.status(404).send("No URL requested");
            }

            const url = req.query.url;
            let parts = url.split("/");
            const originalFilename = parts[parts.length - 1];
            const dots = originalFilename.split(".");
            const originalFileType = dots[dots.length - 1]; // last . (now works with .svg.png)
            const filename = parts[4] + "." + originalFileType;

            if (!["dl.airtable.com", "media.slmn.io"].some(domain => domain === parts[2])) {
                return res.status(400).send("Domain not whitelisted");
            }


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

            if (["svg", "gif"].includes(originalFileType)) {
                // just do orig if svg
                size = "orig";
            }
            /* else if (!["png", "jpeg", "webp"].includes(originalFileType)) {
                return res.status(400).send("Unsupported image type");
            }*/


            let imagePath = await getImage(filename, size);

            if (imagePath) return res.sendFile(imagePath);
            console.log("[image]", `no file for ${originalFilename} @ ${size}`);
            // no image

            // first download or retrieve to orig/
            let orig = await getOrWaitForDownload(url, filename, "orig");
            // let orig = await getImage(filename, "orig");
            // console.log("[image]", "orig", orig);
            if (!orig) {
                const t = Date.now();
                console.log("[image]", `downloading ${originalFilename} @ orig...`);
                await downloadImage(url, filename, "orig");
                console.log("[image]", `downloaded ${originalFilename} @ orig in ${Date.now() - t}ms`);
                orig = await getImage(filename, "orig");
                if (size === "orig") return res.sendFile(orig);
            }

            // resize time!
            // console.log("[image]", `resizing ${originalFilename} @ ${size}`);
            const t = Date.now();

            await resizeImage(filename, size, sizeData);
            let resizedImagePath = await getImage(filename, size);

            console.log("[image]", `resized ${originalFilename} @ ${size} in ${Date.now() - t}ms`);

            if (resizedImagePath) return res.sendFile(resizedImagePath);

        } catch (e) {
            console.error("Image error", e);
            return res.status(400).send(e.message);
        }
        res.status(400).send("An error occurred");
    }
    app.get("/image", handleImageRequests);
    app.get("/image.:fileFormat", handleImageRequests); // ignoring requested file format here

    async function handleThemeRequests(req, res) {
        try {
            let t = new Date();
            if (!req.query.id) {
                return res.status(404).send("No theme ID requested");
            }
            let size = parseInt(req.query.size) || 500;
            let padding = size * ((req.query.padding || 5) / 100);

            if (size > 3000) return res.status(400).send("Requested image too large");


            let theme = await Cache.get(req.query.id);
            if (!theme.default_logo?.[0]?.url) return res.status(400).send("No logo to use");
            let logoURL = theme.default_logo?.[0]?.url;
            let themeColor = theme.color_logo_background || theme.color_theme || "#222222";

            // background: logo background
            // centered logo
            // with ?padding around it

            let filePath = await fullGetURL(logoURL, "orig", null);

            let resizedImage = await sharp(filePath).resize({
                width: size - padding,
                height: size - padding,
                fit: "contain",
                background: themeColor
            }).toBuffer();

            res.header("Content-Type", "image/png");

            return sharp({
                create: {
                    width: size,
                    height: size,
                    channels: 3,
                    background: themeColor
                }
            })
                .composite([
                    { input: resizedImage }
                ])
                .png()
                .toBuffer()
                .then(data => {
                    res.end(data);
                    console.log("[image]", `theme processed @${size} in ${Date.now() - t}ms`);
                });

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
            let padding = size * ((req.query.padding || 5) / 100);

            let match = await Cache.get(id);
            if (!match?.id) return res.status(400).send("No valid match data");

            if ((match.teams || []).length === 2) {
                // do 2 teams side by side
                let teams = await Promise.all(match.teams.map(async tID => {
                    let data = await Cache.get(tID);
                    if (data?.theme?.[0]) data.theme = await Cache.get(data.theme[0]);
                    // console.log(data, data.theme);
                    return data;
                }));

                let thumb = await sharp({ create: {
                    width: width,
                    height: size,
                    channels: 3,
                    background: "#222222"
                }});

                let logos = await Promise.all(teams.map(async team => {
                    let filePath = await fullGetURL(team.theme.default_logo[0].url, "orig", null);
                    let themeColor = team.theme.color_logo_background || team.theme.color_theme || "#222222";

                    let resizedLogo = await sharp(filePath).resize({
                        width: halfWidth - padding,
                        height: size - padding,
                        fit: "contain",
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }).toBuffer();

                    return await sharp({ create: { width: halfWidth, height: size, channels: 4, background: themeColor }})
                        .composite([{ input: resizedLogo }]).png().toBuffer();
                }));

                thumb.composite(logos.map((shp, i) => ({
                    input: shp,
                    left: i * halfWidth,
                    top: 0
                })));

                let thumbBuffer = await thumb.png().toBuffer();
                return res.header("Content-Type", "image/png").send(thumbBuffer);


            } else {
                // do event only
                if (!match.event) return res.status(400).send("No event data");
                let event = await Cache.get(match.event[0]);
                if (event.theme) event.theme = await Cache.get(event.theme[0]);
                if (!event.theme?.id) return res.status(400).send("No event theme data");
                let themeColor = event.theme.color_logo_background || event.theme.color_theme || "#222222";

                let filePath = await fullGetURL(event.theme.default_logo[0].url, "orig", null);

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
