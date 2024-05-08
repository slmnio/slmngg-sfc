/*
* Sub Tourney 4 automatic updates
*
* 1) Get updated data (battletags, Discord tags, pronouns, ...) and update SLMN.GG records
* 2) Format data from player signups and add it to the player.draft_data field on SLMN.GG records
* 3) Update the ST4 Airtable records with how the process went.
* */

module.exports = function(airtable) {

    const bases = {
        st4: airtable.base("appauIFW019nLZJ5t"),
        slmngg: airtable.base("apppzANPbAht3LmAQ")
    };

    async function getPlayerToProcess() {
        try {
            let [player] = await bases.st4("Players").select({
                maxRecords: 1,
                view: "SLMN.GG Processing"
            }).all();
            return player;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function findSLMNGGRecord(player) {
        let [record] = await bases.slmngg("Players").select({
            maxRecords: 1,
            filterByFormula: `OR(LOWER({Battletag}) = "${player.get("Battletag").toLowerCase()}", LOWER({Discord Tag}) = "${player.get("Discord Tag").toLowerCase()}", LOWER({Name}) = "${player.get("Name").toLowerCase()}")`
        }).all();
        if (!record) return null;
        console.log(player.get("Name"), record.get("Name"));
        return record;
    }

    function ggURL(record) {
        return `https://dev.slmn.gg/player/${record.id}`;
    }

    function generateDraftData(player) {
        return {
            "best_heroes": player.get("Best Heroes"),
            "sr": {
                "tank": player.get("Tank SR"),
                "dps": player.get("DPS SR"),
                "support": player.get("Support SR"),
                "role": player.get("Role SR")
            },
            "role": player.get("Main role"),
            "info_for_captains": player.get("Info for captains"),
            "is_draftable": !player.get("Teams")
        };
    }

    function getGGrole(role) {
        return {
            "Hitscan DPS": "DPS",
            "Flex DPS": "DPS",
            "Off tank": "Tank",
            "Main tank": "Tank",
            "Flex Support": "Support",
            "Main Support": "Support",
        }[role];
    }

    async function processPlayer(player) {
        let slmnGGrecord = await findSLMNGGRecord(player);

        let slmnGGdata = {};
        let st4Status = [];

        // Update data
        slmnGGdata = {
            ...slmnGGdata,
            "Pronouns": player.get("Pronouns"),
            "Discord Tag": player.get("Discord Tag"),
            "Battletag": player.get("Battletag"),
            "Pronunciation": player.get("Pronunciation"),
            "Draft Data": JSON.stringify(generateDraftData(player)),
            "Role": getGGrole(player.get("Main role")),
            "Event Signups": ["recP4mvhETp61vugg"]
        };

        if (slmnGGrecord) {
            st4Status.push(`Found SLMN.GG profile: ${ggURL(slmnGGrecord)}`);
            // update
            try {
                await bases.slmngg("Players").update(slmnGGrecord.id, slmnGGdata);
                st4Status.push("Record updated successfully");
            } catch (e) {
                console.error(e);
                st4Status.push("ERR: record update failed");
            }
        } else {
            // create
            try {
                slmnGGrecord = await bases.slmngg("Players").create({
                    ...slmnGGdata,
                    "Name": player.get("Name")
                });
                console.log(slmnGGrecord);
                st4Status.push(`No SLMN.GG profile detected, created one: ${ggURL(slmnGGrecord)}`);
            } catch (e) {
                console.error(e);
                st4Status.push("ERR: record creation failed");
            }
        }

        await player.updateFields({
            "Send to SLMN.GG": false,
            "SLMN.GG Status": st4Status.join(", ")
        });
    }

    setInterval(async () => {
        let player = await getPlayerToProcess();
        if (!player) return;
        await processPlayer(player);
    }, 3000);


};
