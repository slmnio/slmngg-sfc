import { getDataServerAddress } from "@/utils/fetch";

export async function authenticatedRequest(auth, url, data) {
    const token = auth?.token;
    if (!token) return { error: true, errorMessage: "No token" };
    return await fetch(`${getDataServerAddress()}/${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authentication: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}

export async function setActiveBroadcast(auth, client, broadcast) {
    if (!auth?.user) return { error: true, errorMessage: "Not authenticated" };

    return await authenticatedRequest(auth, "actions/set-active-broadcast", {
        client: client.id || client, broadcast: broadcast.id || broadcast
    });
}

export async function updateProfileData(auth, profileData) {
    if (!auth?.user) return { error: true, errorMessage: "Not authenticated" };
    return await authenticatedRequest(auth, "actions/update-profile-data", {
        profileData
    });
}

export async function updateMatchData(auth, match, updatedData) {
    if (!auth?.user) return { error: true, errorMessage: "Not authenticated" };
    return await authenticatedRequest(auth, "actions/update-match-data", {
        matchID: match.id,
        updatedData
    });
}

export async function updateMapData(auth, match, mapData) {
    if (!auth?.user) return { error: true, errorMessage: "Not authenticated" };
    return await authenticatedRequest(auth, "actions/update-map-data", {
        matchID: match.id,
        mapData
    });
}
export async function togglePlayerCams(auth) {
    console.log(auth);
    if (!auth?.user) return { error: true, errorMessage: "Not authenticated" };
    console.log(auth);
    return await authenticatedRequest(auth, "actions/toggle-player-cams");
}
