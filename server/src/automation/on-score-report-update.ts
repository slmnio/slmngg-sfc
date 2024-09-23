import { AnyAirtableID, EventSettings, Report } from "../types.js";
import { get } from "../action-utils/action-cache.js";
// @ts-expect-error not a ts file
import { getInternalManager } from "../action-utils/action-manager.js";

export default {
    /**
     *
     * @param {AnyAirtableID} id
     * @param {object} newData
     * @param {object?} oldData
     * @returns {Promise<void>}
     */
    async handler({ id, newData: report, oldData }: { id: AnyAirtableID, newData: Report, oldData: Report }) {
        if (report?.__tableName !== "Reports") return;

        if (!report?.match?.length) return;
        const match = await get(report?.match?.[0]);
        if (!match?.id) return;
        if (!match?.event?.length) return;
        const event = await get(match?.event?.[0]);
        if (!event?.id || !event?.blocks) return;

        const eventSettings = JSON.parse(event.blocks) as EventSettings;
        if (!eventSettings?.reporting?.score?.use) return;

        if (report.type === "Scores" && report.data) {
            const reportApproved =
                report.approved_by_team &&
                (eventSettings.reporting.score.opponentApprove ? report.approved_by_opponent : true) &&
                (eventSettings.reporting.score.staffApprove ? report.approved_by_staff : true);

            if (reportApproved) {
                // Process approval
                console.log("Report is now ready for approval");
                const manager = getInternalManager();
                if (!manager) return console.error("No internal manager can run automation action");
                try {
                    await manager.runActionAsAutomation("update-map-data", {
                        matchID: match.id,
                        mapData: JSON.parse(report.data)
                    });
                    // Delete record here (not implemented?)
                    console.log("Can now delete the score report");
                } catch (e) {
                    console.error("Action error - not continuing");
                }
            } else {
                // Not ready to approve - see what changed though

                if (eventSettings.reporting.score.opponentApprove && (!oldData.approved_by_opponent && report.approved_by_opponent)) {
                    // Now approved by opponent
                    console.log("Report not ready for approval but has been approved by opponent");
                } else if (!oldData.approved_by_team && report.approved_by_team) {
                    console.log("Report has been approved by initial team");
                    console.log({oldData, newData: report});
                } else {
                    // other change
                    console.log("Report changed something else");
                    const keys = Object.keys({...report,...structuredClone(oldData)}) as (keyof Report)[];
                    const changes = keys
                        .map(key => ({ key, newVal: report[key], oldVal: structuredClone(oldData[key])}))
                        .filter(({ oldVal, newVal}) => JSON.stringify(oldVal) !== JSON.stringify(newVal));

                    console.log({oldData, newData: report});
                    console.log(changes);

                }
            }
        }
    }
};
