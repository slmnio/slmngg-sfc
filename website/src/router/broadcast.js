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
import SponsorOverlay from "@/components/broadcast/SponsorOverlay";
import MapsOverlay from "@/components/broadcast/MapsOverlay";
import BreakBarOverlay from "@/components/broadcast/BreakBarOverlay";
import PodcastOverlay from "@/components/broadcast/PodcastOverlay";
import BrandingOverlay from "@/components/broadcast/BrandingOverlay";
import AuctionOverlay from "@/components/broadcast/auction/AuctionOverlay";
import AdReadOverlay from "@/components/broadcast/AdReadOverlay";
import SyncerOverlay from "@/components/broadcast/SyncerOverlay";
import LogoAdOverlay from "@/components/broadcast/LogoAdOverlay";

export default [
    { path: "ingame", component: IngameOverlay, props: route => ({ codes: route.query.codes }) },
    { path: "break", component: BreakOverlay },
    { path: "syncer", component: SyncerOverlay },
    { path: "break-bar", component: BreakBarOverlay },
    { path: "bracket", component: BracketOverlay, props: route => ({ bracketKey: route.query.key, extended: !!route.query.extended, scale: route.query.scale }) },
    { path: "schedule", component: ScheduleOverlay },
    { path: "standings", component: StandingsOverlay },
    { path: "roster", redirect: "rosters" },
    { path: "rosters", component: RosterOverlay },
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
