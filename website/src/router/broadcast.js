import IngameOverlay from "@/components/broadcast/roots/IngameOverlay";
import BreakOverlay from "@/components/broadcast/break/BreakOverlay";
import BracketOverlay from "@/components/broadcast/roots/BracketOverlay";
import ScheduleOverlay from "@/components/broadcast/roots/ScheduleOverlay";
import StandingsOverlay from "@/components/broadcast/roots/StandingsOverlay";
import RosterOverlay from "@/components/broadcast/roots/RosterOverlay";
import EventThumbnailCreator from "@/components/broadcast/EventThumbnailCreator";
import DraftOverlay from "@/components/broadcast/roots/DraftOverlay";
import DeskOverlay from "@/components/broadcast/desk/DeskOverlay";
import CustomOverlay from "@/components/broadcast/roots/CustomOverlay";
import InfoOverlay from "@/components/broadcast/roots/InfoOverlay";
import BroadcastBackground from "@/components/broadcast/BroadcastBackground";
import SponsorOverlay from "@/components/broadcast/roots/SponsorOverlay";
import MapsOverlay from "@/components/broadcast/roots/MapsOverlay";
import BreakBarOverlay from "@/components/broadcast/break/BreakBarOverlay";
import PodcastOverlay from "@/components/broadcast/roots/PodcastOverlay";
import BrandingOverlay from "@/components/broadcast/roots/BrandingOverlay";
import AuctionOverlay from "@/components/broadcast/auction/AuctionOverlay";
import AdReadOverlay from "@/components/broadcast/roots/AdReadOverlay";
import SyncerOverlay from "@/components/broadcast/roots/SyncerOverlay";
import LogoAdOverlay from "@/components/broadcast/roots/LogoAdOverlay";
import HistoryOverlay from "@/components/broadcast/roots/HistoryOverlay";
import CamsOverlay from "@/components/broadcast/cams/CamsOverlay";
import CamOverlay from "@/components/broadcast/cams/CamOverlay";
import DeskCamsOverlay from "@/components/broadcast/cams/DeskCamsOverlay";

export default [
    { path: "ingame", component: IngameOverlay, props: route => ({ codes: route.query.codes }) },
    { path: "cams", component: CamsOverlay, props: route => ({ buffer: route.query.buffer || route.query.delay, bitrate: route.query.bitrate }) },
    { path: "desk-cams", component: DeskCamsOverlay, props: route => ({ buffer: route.query.buffer || route.query.delay, bitrate: route.query.bitrate, scale: route.query.scale }) },
    {
        path: "pov",
        component: CamOverlay,
        props: route => ({
            number: route.query.number || route.query.player,
            buffer: route.query.buffer || route.query.delay,
            bitrate: route.query.bitrate,
            scale: route.query.scale,
            full: !!route.query.full || !!route.query.relay,
            alwaysShow: !!route.query.alwaysShow || !!route.query.relay,
            relay: !!route.query.relay,
            codec: route.query.codec
        })
    },
    { path: "break", component: BreakOverlay },
    { path: "syncer", component: SyncerOverlay },
    { path: "break-bar", component: BreakBarOverlay },
    { path: "bracket", component: BracketOverlay, props: route => ({ bracketKey: route.query.key, extended: !!route.query.extended || !!route.query.expanded || !!route.query.full, scale: route.query.scale }) },
    { path: "schedule", component: ScheduleOverlay },
    { path: "standings", component: StandingsOverlay },
    { path: "roster", redirect: "rosters" },
    { path: "rosters", component: RosterOverlay, props: route => ({ showRoles: route.query.roles, sort: route.query.sort }) },
    { path: "history", component: HistoryOverlay, props: route => ({ max: route.query.max || 5 }) },
    { path: "thumbnail", component: EventThumbnailCreator },
    { path: "draft", component: DraftOverlay },
    { path: "casters", component: DeskOverlay, props: route => ({ group: "casters" }) },
    { path: "podcast", component: PodcastOverlay, props: route => ({ rows: route.query.rows }) },
    { path: "custom", component: CustomOverlay },
    { path: "info", component: InfoOverlay },
    { path: "background", component: BroadcastBackground, props: route => ({ index: route.query.index }) },
    { path: "sponsors", component: SponsorOverlay },
    { path: "maps", component: MapsOverlay },
    { path: "branding", component: BrandingOverlay },
    { path: "auction", component: AuctionOverlay, props: route => ({ category: route.query.category }) },
    { path: "ad-read", component: AdReadOverlay, props: route => ({ extraDelay: route.query.delay }) },
    { path: "logos", component: LogoAdOverlay }
];
