import * as express from "express";
import * as crypto from "crypto";
import Airtable from "airtable";
import bodyParser from "body-parser";
import * as Cache from "./cache.js";
import cors from "cors";
import { cleanID, dirtyID, multiple } from "shared";
import { EventEmitter } from "events";
import { deAirtableRecord } from "./action-utils/action-utils.js";

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
if (!process.env.AIRTABLE_APP) throw "No AIRTABLE_APP specified";
const slmnWebhook = airtable.base(`bases/${process.env.AIRTABLE_APP}`);

async function getSchema() {
    const fieldNames = new Map();
    try {
        const tables = (await (airtable.base(`meta/bases/${process.env.AIRTABLE_APP}`)).makeRequest({
            path: "/tables"
        })).body.tables;

        for (const table of tables) {
            fieldNames.set(table.id, table.name);
            for (const field of table.fields) {
                fieldNames.set(field.id, field.name);
            }
        }
        return fieldNames;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default async function load({ app }: { app: express.Express }) {
    const webhookRouter = express.Router();
    webhookRouter.use(bodyParser.json());
    webhookRouter.options("/*", cors());
    console.log("Setting up webhook handler");

    const secrets: {[k: string]: string} = {};
    const webhooks: {[k: string]: any} = {};

    const schemaFieldNames = await getSchema();


    // webhookRouter.get("/schema", (req, res) => res.json(schemaFieldNames));


    const emitter = new EventEmitter();

    try {


        const existing = await slmnWebhook.makeRequest({
            path: "/webhooks"
        });

        if (existing.body?.webhooks?.length) {
            for (const webhook of existing.body.webhooks) {

                if (webhook.notificationUrl === process.env.AIRTABLE_WEBHOOK_DELIVERY_URL) {
                    await slmnWebhook.makeRequest({
                        path: `/webhooks/${webhook.id}`,
                        method: "DELETE"
                    });
                }


                // console.log(`deleting webhook ${webhook.id}`)
                // if (existing.body.webhooks.length >= 10) {
                // } else {
                //     webhooks[webhook.id as string] = webhook;
                // }

            }
        }

        const webhook = await slmnWebhook.makeRequest({
            method: "POST",
            path: "/webhooks",
            body: {
                "notificationUrl": process.env.AIRTABLE_WEBHOOK_DELIVERY_URL,
                specification: {
                    options: {
                        filters: {
                            dataTypes: [
                                "tableData"
                            ],
                            // fromSources: [
                            //     "client",
                            //     "automation",
                            //     "system",
                            //     "sync",
                            // ]
                        },
                        // includes: {
                        //     includeCellValuesInFieldIds: "all",
                        //     includePreviousCellValues: true
                        // }
                    }
                }
            }
        });

        setInterval(async () => {
            console.log("[webhook] refreshing webhook");
            try {
                const res = await slmnWebhook.makeRequest({
                    path: `/webhooks/${webhook.body.id}/refresh`,
                    method: "POST"
                });
                console.log(`[webhook] refreshed until ${res?.body?.expirationTime}`);
            } catch (e) {
                console.error(e);
            }
            // every 24hrs
        }, 1000 * 60 * 60 * 24);
        // }, 1000 * 60 * 1);

        if (webhook.body?.macSecretBase64) {
            console.log(`[webhook] webhook ${webhook.body.id} set up`);
            secrets[webhook.body.id as string] = webhook.body.macSecretBase64;
            webhooks[webhook.body.id as string] = webhook.body;
        }
    } catch (e) {
        console.error(e);
    }

    const emitterCursors = new Map<string, number>();

    emitter.on("delivery", async ({ base, webhook, timestamp }) => {
        if (!schemaFieldNames) return console.error("No database schema to process delivery");
        try {
            const data = (await slmnWebhook.makeRequest({
                path: `/webhooks/${webhook.id}/payloads`,
                qs: {
                    cursor: emitterCursors.get(webhook.id) || 1
                }
            })).body;


            if (data.cursor) {
                emitterCursors.set(webhook.id, data.cursor);
            }
            // console.dir(data, { depth: Infinity });

            const changes: {[k: string]: any} = {};

            if (data.payloads?.length) {
                console.log(`[webhook] pinged ${webhook.id} with ${multiple(data.payloads.length, "payload")}`);
                for (const payload of data.payloads) {
                    // console.log(payload);
                    for (const [tableID, table] of Object.entries(payload.changedTablesById)) {
                        // console.log(`Table ${tableID} has data`, table);

                        for (const [recordID, record] of Object.entries((table as any).changedRecordsById)) {
                            const recordData : {[k: string]: any} = {
                                __tableName: schemaFieldNames.get(tableID),
                                // "Modified": (new Date((new Date()).getTime() - (2 * 1000))).toString()
                            };

                            // console.log(`Record ${recordID} has data`, record);
                            for (const [fieldID, fieldValue] of Object.entries((record as any).current.cellValuesByFieldId)) {
                                if (fieldValue) {
                                    if (typeof fieldValue === "object" && "id" in fieldValue && typeof fieldValue.id === "string") {
                                        recordData[schemaFieldNames.get(fieldID)] = dirtyID(fieldValue.id);
                                    } else if (typeof fieldValue === "object" && "length" in fieldValue && fieldValue.length) {
                                        recordData[schemaFieldNames.get(fieldID)] = (fieldValue as any[]).map(val => (typeof val === "object" && "id" in val) ? dirtyID(val?.id) : val);
                                    } else {
                                        recordData[schemaFieldNames.get(fieldID)] = fieldValue;
                                    }
                                }
                            }

                            if (recordData["Modified"]) {
                                changes[recordID] = deAirtableRecord({
                                    fields: recordData,
                                    id: recordID
                                });
                                console.log(changes[recordID]);
                            }
                        }
                    }
                }
            }


            const changeArray = Object.entries(changes);
            console.log(`[webhook] updating ${changeArray.length} item${changeArray.length === 1 ? "" : "s"}`);
            await Promise.all(changeArray.map(([recordID, recordData]) => Cache.partialSet(cleanID(recordID), recordData, { eager: true, source: "webhook-delivery" })));

            if (data.mightHaveMore) {
                console.log("[webhook] might have more");
                emitter.emit("delivery", ({ base, webhook, timestamp }));
            }

        } catch (e) {
            console.error(e);
        }
    });


    webhookRouter.post("/delivery", async (req, res) => {
        const verified = req.headers["x-airtable-content-mac"] === getHmac(req.body.webhook.id, req.body);

        if (!verified) {
            console.error("Unverified webhook delivery");
            return res.status(401).send();
        }

        emitter.emit("delivery", req.body);

        return res.status(204).send();
    });
    // webhookRouter.get("/deliveries", async (req, res) => {
    //     res.json(await Promise.all(Object.keys(webhooks).map(async id => {
    //
    //         try {
    //             return ({
    //                 id,
    //                 data: (await slmnWebhook.makeRequest({
    //                     path: `/webhooks/${id}/payloads`
    //                 }))?.body
    //             });
    //         } catch (e) {
    //             console.error(e);
    //         }
    //         return null;
    //     })));
    // });
    // webhookRouter.get("/webhooks", async (req, res) => {
    //     const { body } = await slmnWebhook.makeRequest({
    //         path: "/webhooks"
    //     });
    //     return res.json(body.webhooks);
    // });
    app.use("/webhook", webhookRouter);


    function getHmac(webhookID: string, payload: any) {
        const macSecretDecoded = Buffer.from(secrets[webhookID], "base64");
        const body = Buffer.from(JSON.stringify(payload), "utf8");
        const hmac = crypto.createHmac("sha256", macSecretDecoded);
        hmac.update(body.toString(), "ascii");
        const expectedContentHmac = "hmac-sha256=" + hmac.digest("hex");

        return expectedContentHmac;
    }
}

