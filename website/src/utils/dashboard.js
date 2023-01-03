import { getDataServerAddress } from "@/utils/fetch";

import { Notyf } from "notyf";
const notyf = new Notyf({ duration: 5000, position: { x: "right", y: "top" }, dismissible: true });

export async function authenticatedRequest(auth, url, data) {
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

export async function setActiveBroadcast(auth, client, broadcast) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }

    return await authenticatedRequest(auth, "actions/set-active-broadcast", {
        client: client.id || client, broadcast: broadcast.id || broadcast
    });
}

export async function updateProfileData(auth, profileData) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/update-profile-data", {
        profileData
    });
}

export async function updateMatchData(auth, match, updatedData) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/update-match-data", {
        matchID: match.id,
        updatedData
    });
}

export async function managePred(auth, client, predictionAction) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/manage-prediction", {
        client: client.id || client,
        predictionAction,
        autoLockAfter: 300
    });
}

export async function startCommercial(auth, client, commercialDuration) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/start-commercial", {
        client: client.id || client,
        commercialDuration
    });
}

export async function updateAutomaticTitle(auth, client) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/set-title", {
        client: client.id || client
    });
}

export async function updateMapData(auth, match, mapData) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/update-map-data", {
        matchID: match.id,
        mapData
    });
}

export async function toggleFlipTeams(auth) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/toggle-flip-teams");
}

export async function updateBroadcastData(auth, data) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/update-broadcast", data);
}

export async function setMatchOverlayState(auth, matchID, overlayType, state) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/set-match-overlays", {
        match: matchID,
        overlayType,
        state
    });
}

export async function resolveEntireBracket(auth, bracketID) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/resolve-entire-bracket", {
        bracketID
    });
}

export async function setObserverSetting(auth, setting, value) {
    if (!auth?.user) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }
    return await authenticatedRequest(auth, "actions/set-observer-setting", {
        setting, value
    });
}
