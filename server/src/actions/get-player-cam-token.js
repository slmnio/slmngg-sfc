const { getInternalManager } = require("../action-utils/action-manager");

const { deAirtable } = require("../action-utils/action-utils");

module.exports = {
    key: "get-player-cam-token",
    requiredParams: [],
    auth: ["user"],
    /***
     * @param {Object?} params
     * @param {UserData} user
     * @param {string} token
     * @returns {Promise<{}>}
     */
    async handler(params, { user, token }) {
        const { AccessToken } = await import("livekit-server-sdk");

        const internalManager = getInternalManager();
        if (!internalManager) throw "Unable to get Live Guest data";
        const liveGuest = await internalManager.runAction("create-live-guest", {}, token);

        const at = new AccessToken("devkey", "secret", {
            identity: liveGuest.id,
            ttl: "10m",
        });
        at.addGrant({ roomJoin: true, room: "player_cams", canPublish: true });

        console.log(liveGuest);

        return await at.toJwt();
    }
};
