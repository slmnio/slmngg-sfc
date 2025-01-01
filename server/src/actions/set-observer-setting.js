export default {
    key: "set-observer-setting",
    requiredParams: ["setting", "value"],
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ActionAuth["client"]} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ setting: observerSetting, value: observerSettingValue }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw "No broadcast associated";

        let newObserverSettings = broadcast.observer_settings || [];

        if (observerSettingValue === "toggle") {
            observerSettingValue = !newObserverSettings.includes(observerSetting);
        }

        if (observerSettingValue) {
            // add to array
            if (!newObserverSettings.includes(observerSetting)) newObserverSettings.push(observerSetting);
        } else {
            // remove from array
            if (newObserverSettings.includes(observerSetting)) newObserverSettings.splice(newObserverSettings.indexOf(observerSetting), 1);
        }

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, {
            "Observer settings": newObserverSettings
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};
