import IngameOverlay from "@/components/broadcast/IngameOverlay";
import BreakOverlay from "@/components/broadcast/BreakOverlay";
import BracketOverlay from "@/components/broadcast/BracketOverlay";
import ScheduleOverlay from "@/components/broadcast/ScheduleOverlay";
import StandingsOverlay from "@/components/broadcast/StandingsOverlay";
import RosterOverlay from "@/components/broadcast/RosterOverlay";
import EventThumbnailCreator from "@/components/broadcast/EventThumbnailCreator";
import DraftOverlay from "@/components/broadcast/DraftOverlay";
import DeskOverlay from "@/components/broadcast/DeskOverlay";
import CustomOverlay from "@/components/broadcast/CustomOverlay";
import InfoOverlay from "@/components/broadcast/InfoOverlay";
import BroadcastBackground from "@/components/broadcast/BroadcastBackground";

export default [
    { path: "ingame", component: IngameOverlay },
    { path: "break", component: BreakOverlay },
    { path: "bracket", component: BracketOverlay, props: route => ({ bracketKey: route.query.key, extended: !!route.query.extended, scale: route.query.scale }) },
    { path: "schedule", component: ScheduleOverlay },
    { path: "standings", component: StandingsOverlay },
    { path: "roster", redirect: "rosters" },
    { path: "rosters", component: RosterOverlay },
    { path: "thumbnail", component: EventThumbnailCreator },
    { path: "draft", component: DraftOverlay },
    { path: "casters", component: DeskOverlay, props: route => ({ group: "casters" }) },
    { path: "custom", component: CustomOverlay },
    { path: "info", component: InfoOverlay },
    { path: "background", component: BroadcastBackground, props: route => ({ index: route.query.index }) }
];
