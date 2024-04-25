import { getDataServerAddress } from "@/utils/fetch";
import { Notyf } from "notyf";
import { useAuthStore } from "@/stores/authStore";

const notyf = new Notyf({ duration: 5000, position: { x: "right", y: "top" }, dismissible: true });

export async function authenticatedRequest(url, data) {
    const auth = useAuthStore();

    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }

    const token = auth?.token;
    if (!token) return { error: true, errorMessage: "No token" };

    try {
        const request = await fetch(`${getDataServerAddress()}/${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authentication: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(res => res.json(), error => {
            notyf.error({ message: `Request error: ${error.message}` });
            console.error("Fetch error", error);
        });
        console.log(request);
        if (request.error) {
            notyf.error({
                message: request.errorMessage
            });
        }
        return request;
    } catch (e) {
        console.error(e);
        return { error: true, errorMessage: e.errorMessage };
    }
}

export async function setActiveBroadcast(client, broadcast) {
    return await authenticatedRequest("actions/set-active-broadcast", {
        client: client.id || client, broadcast: broadcast.id || broadcast
    });
}

export async function updateProfileData(profileData) {
    return await authenticatedRequest("actions/update-profile-data", {
        profileData
    });
}

export async function updateMatchData(match, updatedData) {
    return await authenticatedRequest("actions/update-match-data", {
        matchID: match.id,
        updatedData
    });
}

export async function managePred(client, predictionAction, predictionType) {
    return await authenticatedRequest("actions/manage-prediction", {
        client: client.id || client,
        predictionAction,
        predictionType,
        autoLockAfter: predictionType === "map" ? 180 : 300
    });
}

export async function startCommercial(client, commercialDuration) {
    return await authenticatedRequest("actions/start-commercial", {
        client: client.id || client,
        commercialDuration
    });
}

export async function updateAutomaticTitle(client) {
    return await authenticatedRequest("actions/set-title", {
        client: client.id || client
    });
}

export async function updateMapData(match, mapData) {
    return await authenticatedRequest("actions/update-map-data", {
        matchID: match.id,
        mapData
    });
}

export async function toggleFlipTeams() {
    return await authenticatedRequest("actions/toggle-flip-teams");
}

export async function updateBroadcastData(data) {
    return await authenticatedRequest("actions/update-broadcast", data);
}

export async function setMatchOverlayState(matchID, overlayType, state) {
    return await authenticatedRequest("actions/set-match-overlays", {
        match: matchID,
        overlayType,
        state
    });
}

export async function resolveEntireBracket(bracketID) {
    return await authenticatedRequest("actions/resolve-entire-bracket", {
        bracketID
    });
}

export async function setObserverSetting(setting, value) {
    return await authenticatedRequest("actions/set-observer-setting", {
        setting, value
    });
}

export async function updateBreakAutomation(options) {
    return await authenticatedRequest("actions/update-break-automation", {
        options
    });
}

export async function updateBreakDisplay(option) {
    return await authenticatedRequest("actions/update-break-display", {
        option
    });
}

export async function updateGfxIndex(gfxID, index) {
    return await authenticatedRequest("actions/update-gfx-index", {
        gfxID, index
    });
}
