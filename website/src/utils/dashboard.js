import { getDataServerAddress } from "@/utils/fetch";
import { Notyf } from "notyf";
import { useAuthStore } from "@/stores/authStore";

const notyf = new Notyf({ duration: 5000, position: { x: "right", y: "top" }, dismissible: true });

export async function authenticatedRequest(_, url, data) {
    if (_) console.warn(url, "Passing auth to methods is deprecated. Remove references and use the pinia store.");

    console.log(url, data);
    const auth = useAuthStore();
    console.log("authenticated request", auth.user);

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
        console.log(request.error, notyf);
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
    return await authenticatedRequest(null, "actions/set-active-broadcast", {
        client: client.id || client, broadcast: broadcast.id || broadcast
    });
}

export async function updateProfileData(auth, profileData) {
    return await authenticatedRequest(auth, "actions/update-profile-data", {
        profileData
    });
}

export async function updateMatchData(match, updatedData) {
    return await authenticatedRequest(null, "actions/update-match-data", {
        matchID: match.id,
        updatedData
    });
}

export async function managePred(client, predictionAction, predictionType) {
    return await authenticatedRequest(null, "actions/manage-prediction", {
        client: client.id || client,
        predictionAction,
        predictionType,
        autoLockAfter: predictionType === "map" ? 180 : 300
    });
}

export async function startCommercial(client, commercialDuration) {
    return await authenticatedRequest(null, "actions/start-commercial", {
        client: client.id || client,
        commercialDuration
    });
}

export async function updateAutomaticTitle(client) {
    return await authenticatedRequest(null, "actions/set-title", {
        client: client.id || client
    });
}

export async function updateMapData(match, mapData) {
    return await authenticatedRequest(null, "actions/update-map-data", {
        matchID: match.id,
        mapData
    });
}

export async function toggleFlipTeams() {
    return await authenticatedRequest(null, "actions/toggle-flip-teams");
}

export async function updateBroadcastData(data) {
    return await authenticatedRequest(null, "actions/update-broadcast", data);
}

export async function setMatchOverlayState(matchID, overlayType, state) {
    return await authenticatedRequest(null, "actions/set-match-overlays", {
        match: matchID,
        overlayType,
        state
    });
}

export async function resolveEntireBracket(bracketID) {
    return await authenticatedRequest(null, "actions/resolve-entire-bracket", {
        bracketID
    });
}

export async function setObserverSetting(setting, value) {
    return await authenticatedRequest(null, "actions/set-observer-setting", {
        setting, value
    });
}

export async function updateBreakAutomation(options) {
    return await authenticatedRequest(null, "actions/update-break-automation", {
        options
    });
}

export async function updateBreakDisplay(option) {
    return await authenticatedRequest(null, "actions/update-break-display", {
        option
    });
}

export async function updateGfxIndex(gfxID, index) {
    return await authenticatedRequest(null, "actions/update-gfx-index", {
        gfxID, index
    });
}
