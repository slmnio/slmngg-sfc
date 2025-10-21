export default [
    {
        path: "ingame",
        component: () => import("@/components/broadcast/roots/IngameOverlay.vue"),
        props: route => ({
            codes: route.query.codes,
            sponsorFadeSpeed: (route.query.sponsorSpeed || route.query.sponsorFadeSpeed),
            basicMode: !!route.query.basic,
            costreamerMode: !!route.query.costreamer
        })
    },
    {
        path: "costream",
        alias: "costreamer",
        component: () => import("@/components/broadcast/roots/IngameOverlay.vue"),
        props: route => ({
            basicMode: !!route.query.basic,
            costreamerMode: true,
            noAnimation: true
        })
    },
    {
        path: "ingame-tester",
        component: () => import("@/components/broadcast/roots/IngameThemeTester.vue")
    },
    {
        path: "ingame-pickban",
        component: () => import("@/components/broadcast/roots/IngamePickBan.vue")
    },
    {
        path: "trivia",
        component: () => import("@/components/broadcast/roots/TriviaOverlay.vue")
    },
    {
        path: "cams",
        component: () => import("@/components/broadcast/cams/CamsWrapper.vue"),
        props: route => ({ params: route.query.params?.split(",") }),
        children: [
            { path: "desk", component: () => import("@/components/broadcast/cams/DeskCamsOverlay.vue") },
            { path: "ingame", component: () => import("@/components/broadcast/cams/CamsOverlay.vue") },
            {
                path: "pov",
                component: () => import("@/components/broadcast/cams/CamOverlay.vue"),
                props: route => ({
                    number: route.query.number || route.query.num || route.query.player,
                    full: !!route.query.full || !!route.query.relay,
                    alwaysShow: !!route.query.alwaysShow || !!route.query.relay,
                    alwaysShowBox: !!route.query.alwaysShowBox || !!route.query.box,
                    relay: !!route.query.relay
                })
            },
            {
                path: "full",
                component: () => import("@/components/broadcast/cams/FullCamOverlay.vue"),
                props: route => ({
                    number: route.query.number || route.query.num || 1,
                    showName: !!route.query.name,
                    showSocials: !!route.query.socials
                })
            }
        ]
    },
    {
        path: "break",
        component: () => import("@/components/broadcast/break/BreakOverlay.vue"),
        props: route => ({
            secondary: !!route.query.secondary,
            interval: route.query.interval || route.query.headlineInterval
        })
    },
    {
        path: "break-content",
        component: () => import("@/components/broadcast/break/BreakContent.vue"),
        props: route => ({
            secondary: !!route.query.secondary,
            interval: route.query.interval || route.query.headlineInterval
        })
    },
    {
        path: "break-schedule",
        component: () => import("@/components/broadcast/break/BreakScheduleOverlay.vue"),
        props: route => ({
            showSponsors: route.query.sponsors || route.query.showSponsors
        })
    },
    {
        path: "versus",
        component: () => import("@/components/broadcast/roots/VersusOverlay.vue"),
        props: route => ({
            vertical: route.query.vertical,
            extraInfo: !!route.query.extra
        })
    },
    {
        path: "winners",
        component: () => import("@/components/broadcast/roots/WinnersOverlay.vue"),
        props: route => ({
            useConfetti: !!route.query.confetti,
            extraInfo: !!route.query.extra
        })
    },
    { path: "map-bump", component: () => import("@/components/broadcast/roots/MapBumpOverlay.vue") },
    { path: "break-bar", component: () => import("@/components/broadcast/break/BreakBarOverlay.vue") },
    {
        path: "break-text",
        component: () => import("@/components/broadcast/break/BreakTextOverlay.vue")
    },
    {
        path: "bracket",
        component: () => import("@/components/broadcast/roots/BracketOverlay.vue"),
        props: route => ({
            bracketKey: route.query.key,
            extended: !!route.query.extended || !!route.query.expanded || !!route.query.full,
            scale: route.query.scale,
            small: !!route.query.small
        })
    },
    {
        path: "schedule",
        component: () => import("@/components/broadcast/roots/ScheduleOverlay.vue"),
        props: route => ({ secondary: !!route.query.secondary })
    },
    {
        path: "head-to-head",
        component: () => import("@/components/broadcast/roots/HeadToHeadScheduleOverlay.vue"),
    },
    { path: "iframe", component: () => import("@/components/broadcast/roots/IframeOverlay.vue"), props: route => ({ url: route.query.url }) },
    { path: "standings", component: () => import("@/components/broadcast/roots/StandingsOverlay.vue"), props: route => ({ stage: route.query.stage || route.query.group }) },
    { path: "bans", component: () => import("@/components/broadcast/roots/HeroBansOverlay.vue") },
    {
        path: "priority",
        component: () => import("@/components/broadcast/roots/HeroPriorityOverlay.vue"),
        props: route => ({
            mode: route.query.mode,
            skip: route.query.skip,
        })
    },
    {
        path: "multi-standings",
        alias: "multistandings",
        component: () => import("@/components/broadcast/roots/MultiStandingsOverlay.vue"),
        props: route => ({
            stageCodes: (route.query.stage || route.query.group || route.query.stages || route.query.groups || "").split(",").filter(Boolean),
            useCodes: !!route.query.codes,
            showColumns: (route.query.columns || route.query.show || "").split(",").filter(Boolean)
        })
    },
    {
        path: "rosters",
        alias: "roster",
        component: () => import("@/components/broadcast/roots/RosterOverlay.vue"),
        props: route => ({
            showRoles: route.query.roles,
            sort: route.query.sort,
            showStaff: route.query.staff,
            showBadges: route.query.badge || route.query.badges,
            splitPlayers: route.query.split ? parseInt(route.query.split) : null
        })
    },
    {
        path: "hero-roster",
        alias: "hero-rosters",
        component: () => import("@/components/broadcast/roots/HeroRosterOverlay.vue"),
        props: route => ({
            teamNum: route.query.team || route.query.teamNum,
            playerCount: route.query.count || route.query.players || route.query.playerCount,
            showRoles: !!route.query.role || !!route.query.roles || !!route.query.icons,
            showPronouns: !!route.query.pronouns
        })
    },
    {
        path: "boxed-roster",
        alias: ["boxed-hero-roster", "boxed-hero-rosters", "boxed-rosters"],
        component: () => import("@/components/broadcast/roots/BoxedHeroRosterOverlay.vue"),
        props: route => ({
            teamNum: route.query.team || route.query.teamNum,
            playerCount: route.query.count || route.query.players || route.query.playerCount || route.query.max,
            showRoles: route.query.role || route.query.roles || route.query.icons,
            showPronouns: !!route.query.pronouns,
            subtitle: route.query.subtitle,
            alternate: route.query.alternate ? parseInt(route.query.alternate) : null,
            video: route.query.video ? parseInt(route.query.video) : null,
            showStaff: !!route.query.staff,
            showHeadshots: !!route.query.headshot || !!route.query.headshots,
            fill: (route.query.fill || "").split(/[,/]/g)
        })
    },
    {
        path: "team-image",
        component: () => import("@/components/broadcast/roots/TeamImageOverlay.vue"),
        props: route => ({
            teamNum: parseInt(route.query.team || route.query.teamNum || "1"),
            imageNum: parseInt(route.query.index || route.query.image || route.query.imageNum || "1"),
            overrideURL: route.query.overrideURL || route.query.override
        })
    },
    {
        path: "history",
        component: () => import("@/components/broadcast/roots/HistoryOverlay.vue"),
        props: route => ({
            max: route.query.max || 5,
            reverse: route.query.reverse !== "false"
        })
    },
    {
        path: "season-history",
        component: () => import("@/components/broadcast/roots/SeasonHistoryOverlay.vue"),
        props: route => ({
            showHeaders: route.query.headers,
            matchCount: route.query.matches || route.query.match || route.query.max,
            stage: route.query.stage || route.query.group
        })
    },
    {
        path: "thumbnail",
        component: () => import("@/components/broadcast/EventThumbnailCreator.vue"),
        props: route => ({
            showSchedule: route.query.schedule
        })
    },
    {
        path: "draft",
        component: () => import("@/components/broadcast/roots/DraftOverlay.vue"),
        props: route => ({
            columns: route.query.columns || route.query.cols || 1,
            icons: route.query.icons !== "false",
            showStaff: route.query.staff !== "false",
            showLogos: route.query.logos !== "false",
            teamRows: route.query.rows || route.query.teamRows || 1,
            eachTeam: route.query.eachTeam || route.query.players,
            category: route.query.category,
            roleColumns: (route.query.columns || route.query.cols) === "role",
            highlightOrder: route.query.order || route.query.highlight
        })
    },
    {
        path: "caster-bg",
        component: () => import("@/components/broadcast/CasterBackground.vue"),
        props: route => ({
            defaultMap: (route.query.map || route.query.default || "").toLowerCase() || null,
            useVideo: (route.query.video !== "false")
        })
    },
    {
        path: "desk",
        alias: "casters",
        component: () => import("@/components/broadcast/desk/DeskOverlay.vue"),
        props: route => ({
            group: "casters",
            disableCasters: route.query.disable || route.query.casters === "false",
            disableLower: route.query.lower === "false",
            ignoreTalentSocket: route.query.ignoreTalentSocket || route.query.ignoreTalent,
            displayOverride: route.query.display
        })
    },
    { path: "podcast", component: () => import("@/components/broadcast/roots/PodcastOverlay.vue"), props: route => ({ rows: route.query.rows }) },
    { path: "podcast-sides", component: () => import("@/components/broadcast/roots/PodcastSidesOverlay.vue") },
    { path: "custom", component: () => import("@/components/broadcast/roots/CustomOverlay.vue") },
    { path: "info", component: () => import("@/components/broadcast/roots/InfoOverlay.vue") },
    {
        path: "bug",
        component: () => import("@/components/broadcast/roots/BugOverlay.vue"),
        props: route => ({
            small: !!route.query.small,
            teamNum: route.query.team || route.query.teamNum,
            animate: route.query.animate
        })
    },
    {
        path: "l-bar",
        component: () => import("@/components/broadcast/roots/LBarOverlay"),
        props: route => ({
            showSponsors: route.query.sponsors || route.query.sponsor,
            sponsorAnimationMode: route.query.sponsorAnimationMode || route.query.sponsorAnim,
            secondary: !!route.query.secondary
        })
    },
    { path: "background", component: () => import("@/components/broadcast/BroadcastBackground.vue"), props: route => ({ index: route.query.index }) },
    { path: "sponsors", component: () => import("@/components/broadcast/roots/SponsorOverlay.vue") },
    { path: "maps", component: () => import("@/components/broadcast/roots/MapsOverlay.vue"), props: route => ({ autoTitle: route.query.auto }) },
    { path: "branding", component: () => import("@/components/broadcast/roots/BrandingOverlay.vue") },
    {
        path: "auction",
        component: () => import("@/components/broadcast/auction/AuctionOverlay.vue"),
        props: route => ({
            category: route.query.category,
            showCaptainInfo: !!route.query.captain,
            undraftedText: route.query.undraftedText || route.query.undrafted || route.query.drop
        })
    },
    { path: "ad-read", component: () => import("@/components/broadcast/roots/AdReadOverlay.vue"), props: route => ({ extraDelay: route.query.delay, startDelay: route.query.start }) },
    { path: "logos", component: () => import("@/components/broadcast/roots/LogoAdOverlay.vue") },
    { path: "staff", component: () => import("@/components/broadcast/roots/StaffOverlay.vue") },
    { path: "player-history", component: () => import("@/components/broadcast/PlayerHistory.vue"), props: route => ({ showMinor: route.query.minor }) },
    {
        path: "overview",
        component: () => import("@/components/broadcast/roots/OverviewOverlay.vue"),
        props: route => ({
            noMapVideos: (route.query.video === "false" || route.query.videos === "false"),
            useLiveDesk: !!route.query.live
        })
    },
    { path: "media", component: () => import("@/components/broadcast/roots/MediaOverlay.vue") },
    {
        path: "music",
        component: () => import("@/components/broadcast/roots/MusicOverlay.vue"),
        props: route => ({
            role: route.query.group || route.query.role,
            showTitle: ["showTitle", "showText", "text", "title", "song"].some(t => route.query[t]),
            volume: parseFloat(route.query.volume) || 0.2,
            crossfadeDuration: parseFloat(route.query.crossfade || route.query.fade) || 10,
            loopSongs: !!route.query.loop
        })
    },
    { path: "desk-graphics", component: () => import("@/components/broadcast/roots/DeskGraphicsOverlay.vue") },
    {
        path: "stinger",
        alias: "empty",
        component: () => import("@/components/broadcast/roots/EmptyStingerOverlay.vue"),
        props: route => ({
            teamNum: route.query.team || route.query.teamNum,
        })
    },
    { path: "broadcasts", alias: ["other-streams", "other-broadcasts"], component: () => import("@/components/broadcast/roots/OtherBroadcastsOverlay.vue") },
    { path: "mvp", component: () => import("@/components/broadcast/roots/MVPOverlay.vue"), props: route => ({
        showSponsor: route.query.sponsor,
        alternate: route.query.alternate ? parseInt(route.query.alternate) : null,
    }) },
    {
        path: "ingame-comms",
        component: () => import("@/components/broadcast/roots/IngameCommsOverlay.vue"),
        props: route => ({
            listenInText: route.query.text,
            buffer: parseInt(route.query.buffer),
            forceTeam: route.query.team ? parseInt(route.query.team) : null
        })
    },
    {
        path: "map-stats",
        component: () => import("@/components/broadcast/roots/MapStatsOverlay.vue"),
        props: route => ({
            number: parseInt(route.query.number || route.query.maps || route.query.count),
            hideCompletedRecords: route.query.hideCompleted || route.query.hide
        })
    },
    {
        path: "audio",
        component: () => import("@/components/broadcast/TeamAudio.vue"),
        props: route => ({
            taskKey: route.query.key,
            buffer: parseInt(route.query.buffer)
        })
    },
    {
        path: "gfx/:index",
        component: () => import("@/components/broadcast/roots/GFXRoot.vue"),
        props: route => ({
            index: parseInt(route.params.index) || parseInt(route.query.index ?? route.query.number) || 1
        })
    },
    {
        path: "confetti",
        component: () => import("@/components/broadcast/roots/ConfettiOverlay.vue"),
        props: route => ({
            themeId: route.query.theme || route.query.themeId || route.query.themeid || route.query.themeID
        })
    },
    {
        path: "champions",
        component: () => import("@/components/broadcast/roots/ChampionsOverlay.vue"),
        props: route => ({
            stingerText: route.query.stingerText
        })
    },

    /* Production staff stuff */
    { path: "clock", component: () => import("@/components/broadcast/roots/MediaClock.vue") },
    { path: "tester", component: () => import("@/components/broadcast/roots/ThemeTransitionTester.vue") },
    { path: "admin", component: () => import("@/components/broadcast/roots/ClientOverview.vue") },
    { path: "syncer", component: () => import("@/components/broadcast/roots/SyncerOverlay.vue") },
    { path: "tally", redirect: { name: "tally-viewer" } },
    {
        path: "tally-viewer",
        name: "tally-viewer",
        component: () => import("@/components/broadcast/roots/TallyViewer.vue"),
        props: route => ({
            customText: ["scene", "scenes", "text", "custom", "customText", "force"].reduce((prev, current) => prev || route.query[current], null)
        })
    },
    {
        path: "tally-dot",
        alias: "dot",
        component: () => import("@/components/broadcast/roots/TallyDot.vue"),
        props: route => ({
            number: parseInt(route.query.number || route.query.number || "1"),
            align: route.query.align || (route.query.left ? "left" : "") || (route.query.right ? "right" : "") || "right"
        })
    },
    {
        path: "quad",
        component: () => import("@/components/broadcast/roots/QuadTallyDot.vue"),
        props: route => ({
            align: route.query.align || (route.query.left ? "left" : "") || (route.query.right ? "right" : "") || "right"
        })
    },
    {
        path: "tally-transmitter",
        component: () => import("@/components/broadcast/roots/TallyTransmitter.vue"),
        props: route => ({
            number: route.query.num || route.query.number
        })
    },
    {
        path: "websocket-transmitter",
        component: () => import("@/components/broadcast/roots/WebsocketTransmitter.vue"),
        props: route => ({
            wsUrl: route.query.url || route.query.wsUrl || route.query.wsurl || route.query.wsURL || "ws://127.0.0.1:4455",
            wsPassword: route.query.wsPassword || route.query.password || route.query.pw
        })
    },
    {
        path: "remote",
        component: () => import("@/components/broadcast/roots/RemoteObsController.vue"),
        props: route => ({
            wsUrl: route.query.url || route.query.wsUrl || route.query.wsurl || route.query.wsURL || "ws://127.0.0.1:4455",
            wsPassword: route.query.wsPassword || route.query.password || route.query.pw
        })
    },
    {
        path: "solo",
        component: () => import("@/components/broadcast/SoloOverlay.vue"),
        props: route => ({
            modules: route.query.modules?.split(","),
            rosterOptions: (route.query.rosterOptions || route.query.roster)?.split(","),
            showMapVideos: !!(route.query.mapVideos || route.query.videos)
        })
    },
    {
        path: "chat",
        component: () => import("@/components/broadcast/roots/PlatformEmbedder.vue"),
        props: ({ view: "chat" })
    }
];
