import { getDataServerAddress } from "@/utils/fetch";
import { Notyf } from "notyf";
import { type AnyAirtableID, useAuthStore } from "@/stores/authStore";
import { type MaybeRef, type MaybeRefOrGetter, toRef } from "vue";

const notyf = new Notyf({ duration: 5000, position: { x: "right", y: "top" }, dismissible: true });

type ActionKey = "create-live-guest" |
    "manage-prediction" |
    "multi-map-win" |
    "resolve-entire-bracket" |
    "set-active-broadcast" |
    "set-match-overlays" |
    "set-observer-setting" |
    "set-title" |
    "start-commercial" |
    "toggle-flip-teams" |
    "update-break-automation" |
    "update-break-display" |
    "update-broadcast" |
    "update-gfx-index" |
    "update-map-data" |
    "update-match-data" |
    "update-profile-data"

type RequestUrl = `actions/${ActionKey}`

type NoRequestData = never
type CreateLiveGuestData = NoRequestData

interface ManagePredictionData {
    predictionType: "match" | "map"
    predictionAction: "create" | "lock" | "resolve" | "cancel"
    autoLockAfter: number
}

interface MultiMapWinData {
    teamNum: 1 | 2
    unsetMapAttack?: boolean
}

interface ResolveEntireBracketData {
    bracketID: AnyAirtableID
}

interface SetActiveBroadcastData {
    broadcastID: AnyAirtableID
    clientID: AnyAirtableID
}

interface SetMatchOverlaysData {
    match: AnyAirtableID
    overlayType: "primary" | "secondary"
    state: boolean
}

interface SetObserverSettingData {
    setting: string
    value: string
}

interface SetTitleData {
    broadcastID: AnyAirtableID
}


interface StartCommercialData {
    commercialDuration: 30 | 60 | 90 | 120 | 150 | 180
}


type ToggleFlipTeamsData = NoRequestData

type BreakAutomationOption =
    "use: Schedule" |
    "use: Standings" |
    "use: Image" |
    "use: Staff" |
    "use: Bracket" |
    "use: Matchup" |
    "use: Title" |
    "use: Other Info" |
    "setting: Always do 30s Matchup" |
    "setting: Always do 30s Schedule";

interface UpdateBreakAutomationData {
    options: BreakAutomationOption[]
}

type UpdateBreakDisplayOptions =
    "Automated" |
    "Schedule" |
    "Standings" |
    "Image" |
    "Bracket" |
    "Staff" |
    "Matchup" |
    "Title" |
    "Other Streams" |
    "Other Info";

interface UpdateBreakDisplayData {
    option: UpdateBreakDisplayOptions
}

interface UpdateBroadcastData {
    match?: AnyAirtableID
    advertise?: boolean
    playerCams?: boolean
    showLiveMatch?: boolean
    mapAttack?: null | "Left" | "Right" | "Both"
    title?: string
    manualGuests?: string
    deskDisplayMode?: null | "Match" | "Predictions" | "Maps" | "Notice (Team 1)" | "Notice (Team 2)" | "Notice (Event)" | "Scoreboard" | "Drafted Maps" | "Interview" | "Hidden" | "Casters"
    deskDisplayText?: string
    countdownEnd?: any
}

interface UpdateGfxIndexData {
    gfxID: AnyAirtableID
    index: number
}

interface UpdateMapDataData {
    matchID: AnyAirtableID
    mapData: Array<{
        map?: string
        existingID?: string
        winner?: string
        banner?: string
        picker?: string
        score_1?: number
        score_2?: number
        draw?: boolean
    }>
}

interface UpdateMatchDataData {
    matchID: AnyAirtableID
    updatedData: {
        special_event?: string
        custom_name?: string
        score_1?: number
        score_2?: number
        start?: any
        forfeit?: boolean
        forfeit_reason?: string
        vod?: string
        vod_2?: string
    }
}

interface UpdateProfileDataData {
    profileData: {
        pronouns?: string
        role?: "DPS" | "Support" | "Tank" | "Flex"
        favourite_hero?: AnyAirtableID
        profile_picture_theme?: AnyAirtableID
    }
}


type ActionRequestData<U> =
    U extends "actions/create-live-guest" ? CreateLiveGuestData :
        U extends "actions/manage-prediction" ? ManagePredictionData :
            U extends "actions/multi-map-win" ? MultiMapWinData :
                U extends "actions/resolve-entire-bracket" ? ResolveEntireBracketData :
                    U extends "actions/set-active-broadcast" ? SetActiveBroadcastData :
                        U extends "actions/set-match-overlays" ? SetMatchOverlaysData :
                            U extends "actions/set-observer-setting" ? SetObserverSettingData :
                                U extends "actions/set-title" ? SetTitleData :
                                    U extends "actions/start-commercial" ? StartCommercialData :
                                        U extends "actions/toggle-flip-teams" ? ToggleFlipTeamsData :
                                            U extends "actions/update-break-automation" ? UpdateBreakAutomationData :
                                                U extends "actions/update-break-display" ? UpdateBreakDisplayData :
                                                    U extends "actions/update-broadcast" ? UpdateBroadcastData :
                                                        U extends "actions/update-gfx-index" ? UpdateGfxIndexData :
                                                            U extends "actions/update-map-data" ? UpdateMapDataData :
                                                                U extends "actions/update-match-data" ? UpdateMatchDataData :
                                                                    U extends "actions/update-profile-data" ? UpdateProfileDataData :
                                                                        any;


export async function authenticatedRequest<U extends RequestUrl>(url: U, data: ActionRequestData<U>, processing?: MaybeRef<boolean>) {
    const auth = useAuthStore();
    const processingRef = toRef(processing);
    if (processingRef.value) processingRef.value = true;

    if ((auth?.user) == null) {
        notyf.error("Not authenticated");
        return { error: true, errorMessage: "Not authenticated" };
    }

    const token = auth?.token;
    if (token == null) return { error: true, errorMessage: "No token" };

    try {
        const request = await fetch(`${getDataServerAddress()}/${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authentication: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(async res => await res.json()).catch(error => {
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
    } finally {
        if (processingRef.value) processingRef.value = false;
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
