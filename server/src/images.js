const sharp = require("sharp");
const fp = require("fs/promises");
const fs = require("fs");
const path = require("path");
const https = require("https");

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
    return path.join(__dirname, "..", "images", size, filename);
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
            console.warn(e);
            if (e.code === "EEXIST") {
                return await getImage(filename, sizeText);
            }
            return null;
        }
    })());
}

module.exports = ({ app, cors, Cache }) => {

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
            let orig = await getImage(filename, "orig");
            // console.log("[image]", "orig", orig);
            if (!orig) {
                const t = Date.now();
                // console.log("[image]", `downloading ${originalFilename} @ orig...`);
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
            return res.status(400).send(e.message);
        }
        res.status(400).send("An error occurred");
    }
    app.get("/image", handleImageRequests);
    app.get("/image.:fileFormat", handleImageRequests); // ignoring requested file format here

};
