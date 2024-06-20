<template>
    <div class="container">
        <LearnTitleChip subtitle="Broadcast Routes" />

        <p>
            All routes start with <code>/broadcast/{broadcastKey}</code> or <code>/client/{clientKey}</code>.
        </p>

        <p>
            You should use the development version of SLMN.GG as it has the latest updates:
            <code>https://dev.slmn.gg</code>
        </p>

        <p>
            It's also necessary to understand <a target="_blank" href="https://en.wikipedia.org/wiki/Query_string">query
                strings</a> when you want to change settings on these overlays.
        </p>

        <p>
            In its basic form, every setting takes the form <code>setting=value</code> (e.g. <code>key=4b</code>, <code>extended=true</code>,
            <code>number=3</code>) and they can be joined together with a <code>&</code> character (e.g. <code>key=4b&extended=true&number=3</code>).
            Query strings must start with a <code>?</code> character to distinguish it from the URL:
            <code>[url]?[query]</code>. Therefore a full URL will look something like the example pages below.
        </p>

        <h2>Example pages</h2>

        <ul>
            <li>
                <a href="https://dev.slmn.gg/client/slmn/bracket" target="_blank">https://dev.slmn.gg/client/slmn/bracket</a>
                - Bracket overlay for SLMN's active broadcast
            </li>
            <li>
                <a href="https://dev.slmn.gg/broadcast/bpl4/bracket?key=4b&extended=true" target="_blank">https://dev.slmn.gg/broadcast/bpl4/bracket?key=4b&extended=true</a>
                - BPL Season 4 broadcast - bracket key "4b" (B League) - shown in extended view
            </li>
            <li>
                <a
                    href="https://dev.slmn.gg/broadcast/gene/rosters?roles=true&sort=true&split=5&background=1"
                    target="_blank">https://dev.slmn.gg/broadcast/gene/rosters?roles=true&sort=true&split=5&background=1</a>
                - Generation Esports broadcast - showing the rosters page - with role icons, sorted players and a split
                after the first 5 players, with the background shown behind the overlay.
            </li>
        </ul>

        <h2>Default query options</h2>

        <p>
            Available to all broadcast routes:
            <ul>
                <li><code>title</code>: String - top title for the generic overlay format</li>
                <li>
                    <code>noAnimate|dontAnimate|noAnimation</code>: Boolean - don't use animation or OBS active
                    detection when transitioning
                </li>
                <li>
                    <code>background</code>: Number - show a background behind the overlay, with the number choosing
                    which background. Usually 1, but others may be listed on the broadcast.
                </li>
            </ul>
        </p>
        <b-input-group prepend="Search">
            <b-form-input v-model="search" placeholder="Search for routes..." type="text" />
        </b-input-group>


        <div v-for="group in filteredGroups" :key="group.title">
            <h2>{{ group.title }}</h2>
            <ul>
                <li v-for="route in group.routes" :key="route.path">
                    <strong>{{ route.name }}</strong> <code>{{ route.path }}</code>
                    <template v-if="route.description"> - {{ route.description }}</template>
                    <ul v-if="route.params">
                        <li v-for="param in route.params" :key="`${route.path}${param.name}`">
                            <code>{{ param.name }}
                                <template v-if="param?.alt">|{{ param.alt?.join("|") }}</template>
                            </code> : {{ param.type }} - {{ param.description }}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>

import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "ToolProdRoutes",
    components: { LearnTitleChip },
    data: () => ({
        groups: [
            {
                title: "Routes with query options",
                routes: [
                    {
                        name: "Ingame",
                        path: "/ingame",
                        params: [
                            {
                                name: "codes",
                                type: "Boolean",
                                description: "true will replace ingame overlay team names with team codes"
                            },
                            {
                                name: "sponsorSpeed",
                                type: "Number",
                                description: "milliseconds to spend on each sponsor before fading to the next one (shown at the bottom)"
                            },
                            {
                                name: "basic",
                                type: "Boolean",
                                description: "true will hide time-sensitive info (score, attack/def icons) and middle text/sponsors (good for replays)"
                            }
                        ]
                    },
                    {
                        name: "Cams (all)",
                        path: "/cams/...",
                        params: [
                            {
                                name: "params",
                                type: "Comma separated",
                                description: "VDO.Ninja paramaters that are passed to the cameras. Works for all sub-routes"
                            }
                        ]
                    },
                    {
                        name: "POV Cams",
                        path: "/cams/pov",
                        params: [
                            {
                                name: "number",
                                alt: ["player"],
                                type: "Integer",
                                description: "number of the player to load (1->12)"
                            },
                            {
                                name: "full",
                                type: "Boolean",
                                description: "make camera full screen rather than placed around game UI"
                            },
                            {
                                name: "alwaysShow",
                                type: "Boolean",
                                description: "ignore cam/client whitelists and always show a cam (as long as there's a guest)"
                            },
                            {
                                name: "alwaysShowBox",
                                type: "Boolean",
                                description: "by default, if a player has no camera, the box with their profile picture is also hidden. set this to true to make it display all the time."
                            },
                            {
                                name: "relay",
                                type: "Boolean",
                                description: "use a relay prefix defined on the broadcast to relay camera feeds"
                            }
                        ]
                    },
                    {
                        name: "Full Screen Cams",
                        path: "/cams/full",
                        params: [
                            {
                                name: "number",
                                alt: ["num"],
                                type: "Integer",
                                description: "number of the guest to show (listed on broadcast.full_cams), defaults to first"
                            },
                            {
                                name: "name",
                                type: "Boolean",
                                description: "show guest's name at the bottom"
                            },
                            {
                                name: "socials",
                                type: "Boolean",
                                description: "show guest's socials (twitter @) at the bottom"
                            }
                        ]
                    },
                    {
                        name: "Break",
                        path: "/break",
                        params: [
                            {
                                name: "secondary",
                                type: "Boolean",
                                description: "when showing the schedule, only show matches on the secondary schedule"
                            },
                            {
                                name: "interval",
                                alt: ["headlineInterval"],
                                type: "Number",
                                description: "milliseconds to show each headline for"
                            }
                        ]
                    },
                    {
                        name: "Desk",
                        path: "/desk",
                        params: [
                            {
                                name: "disable",
                                type: "Boolean",
                                description: "whether to prevent caster cams from loading"
                            }
                        ]
                    },
                    {
                        name: "Bracket",
                        path: "/bracket",
                        params: [
                            {
                                name: "key",
                                type: "String",
                                description: "chooses which bracket from the event to show"
                            },
                            {
                                name: "extended",
                                alt: ["expanded", "full"],
                                type: "Boolean",
                                description: "full screen bracket display, no background/title"
                            },
                            {
                                name: "scale",
                                type: "Number",
                                description: "multiplier for the bracket's overlay scale"
                            },
                            {
                                name: "small",
                                type: "Boolean",
                                description: "hides headers, replaces names with codes etc"
                            }
                        ]
                    },
                    {
                        name: "Schedule",
                        path: "/schedule",
                        params: [
                            {
                                name: "secondary",
                                type: "Boolean",
                                description: "takes schedule matches marked as Show on Secondary Overlays instead"
                            }
                        ]
                    },
                    {
                        name: "Standings",
                        path: "/standings",
                        params: [
                            {
                                name: "stage",
                                alt: ["group"],
                                type: "String",
                                description: "tries to find standings data from the event and use that instead of broadcast.current_stage"
                            }
                        ]
                    },
                    {
                        name: "Multi Standings",
                        path: "/multi-standings",
                        params: [
                            {
                                name: "stages",
                                alt: ["groups"],
                                type: "Comma-separated",
                                description: "all groups you want to display. will try to find data from event if possible"
                            },
                            {
                                name: "codes",
                                type: "Boolean",
                                description: "show team codes instead of full team names (good if you need to shorten them)"
                            },
                            {
                                name: "columns",
                                alt: ["show"],
                                type: "Comma-seprated (default: Matches,Maps,MapDiff)",
                                description: "which columns to show in the standings"
                            }
                        ]
                    },
                    {
                        name: "Iframe",
                        path: "/iframe",
                        params: [
                            {
                                name: "url",
                                type: "URL",
                                description: "page to embed in the overlay body"
                            }
                        ]
                    },
                    {
                        name: "Rosters",
                        path: "/rosters",
                        params: [
                            {
                                name: "roles",
                                type: "Boolean",
                                description: "show role icons next to player names"
                            },
                            {
                                name: "sort",
                                type: "Boolean",
                                description: "order players as Tank/DPS/Support/Flex if they have roles"
                            },
                            {
                                name: "staff",
                                type: "Boolean",
                                description: "show staff in a second group below players"
                            },
                            {
                                name: "badge",
                                alt: ["badges"],
                                type: "Boolean",
                                description: "show a badge on players who had a team in a previous event (set by broadcast.highlight_event)"
                            },
                            {
                                name: "split",
                                type: "Number",
                                description: "number of players to split at - the first X will be in one group, remaining in a second group. good to highlight subs, might need custom CSS"
                            }
                        ]
                    },
                    {
                        name: "Hero Roster",
                        path: "/hero-roster",
                        params: [
                            {
                                name: "team",
                                alt: ["teamNum"],
                                type: "number",
                                description: "number of team to show (1 or 2 for the first or second team in the broadcast.live_match, or 3 for the broadcast.highlight_team)"
                            },
                            {
                                name: "count",
                                alt: ["players"],
                                type: "number",
                                description: "number of players to show before dropping the rest"
                            },
                            {
                                name: "roles",
                                alt: ["icons"],
                                type: "Boolean",
                                description: "show player roles (dps/tank/support) below the names"
                            },
                            {
                                name: "pronouns",
                                type: "Boolean",
                                description: "show player pronouns below names"
                            }
                        ]
                    },
                    {
                        name: "Match History",
                        path: "/history",
                        params: [
                            {
                                name: "max",
                                type: "Integer (default: 5)",
                                description: "the number of matches to show"
                            }
                        ]
                    },
                    {
                        name: "Draft",
                        path: "/draft",
                        params: [
                            {
                                name: "columns",
                                type: "Integer (default: 1)",
                                description: "number of columns to show for undrafted players"
                            },
                            {
                                name: "icons",
                                type: "Boolean (default: true)",
                                description: "show role icons next to players"
                            },
                            {
                                name: "staff",
                                type: "Boolean (default: true)",
                                description: "show team staff at the top"
                            },
                            {
                                name: "logos",
                                type: "Boolean (default: true)",
                                description: "show team logos at the top"
                            },
                            {
                                name: "eachTeam|players",
                                type: "Number",
                                description: "number of players to show on each team (will fill the rest with dummy slots)"
                            }
                        ]
                    },
                    {
                        name: "Podcast",
                        path: "/podcast",
                        params: [
                            {
                                name: "rows",
                                type: "Integer (default: 2)",
                                description: "number of rows for the podcast view"
                            }
                        ]
                    },
                    {
                        name: "Background",
                        path: "/background",
                        params: [
                            {
                                name: "index",
                                type: "Integer (default: 1)",
                                description: "1-based index of broadcast.background attachment field"
                            }
                        ]
                    },
                    {
                        name: "Maps",
                        path: "/maps",
                        params: [
                            {
                                name: "auto",
                                type: "<null|score> (default: null)",
                                description: "automatic title generation, score will do XXA 0 - 0 XXB"
                            }
                        ]
                    },
                    {
                        name: "Auction",
                        path: "/auction",
                        params: [
                            {
                                name: "category",
                                type: "String",
                                description: "filter to teams that belong in that Team Category (eg 'B League')"
                            },
                            {
                                name: "captain",
                                type: "Boolean",
                                description: "show captain info (player.draft_data) on broadcast"
                            }
                        ]
                    },
                    {
                        name: "Ad Read",
                        path: "/ad-read",
                        params: [
                            {
                                name: "delay",
                                type: "Integer",
                                description: "delay in ms to wait after audio has finished before moving on. Sometimes useful in OBS for some reason"
                            }
                        ]
                    },
                    {
                        name: "Player History",
                        path: "/player-history",
                        params: [
                            {
                                name: "minor",
                                type: "Boolean",
                                description: "show minor teams"
                            }
                        ]
                    },
                    {
                        name: "Caster Background",
                        path: "/caster-bg",
                        params: [
                            {
                                name: "map",
                                alt: ["default"],
                                type: "String",
                                description: "name of the default map to show when there's no next map available (otherwise it will be a random map video)"
                            },
                            {
                                name: "video",
                                type: "Boolean (default: true)",
                                description: "whether to use map videos (if false, it will use a static image of the map)"
                            }
                        ]
                    },
                    {
                        name: "Music",
                        path: "/music",
                        params: [
                            {
                                name: "group",
                                alt: ["role"],
                                type: "String",
                                description: "which track group to play from (usually desk, break or ads but technically free input if there's a matching broadcast.track_group_roles with a track_group.role that matches)"
                            },
                            {
                                name: "text",
                                alt: ["showText", "title", "showTitle"],
                                type: "Boolean",
                                description: "whether to show the song's name & artist as text"
                            },
                            {
                                name: "volume",
                                type: "Float (default 0.2)",
                                description: "volume of songs (0 to 1)"
                            },
                            {
                                name: "crossfade",
                                alt: ["fade"],
                                type: "Number (default 10)",
                                description: "number of seconds to crossfade between songs (will start playing song B when song A reaches the last N seconds)"
                            },
                            {
                                name: "loop",
                                type: "Boolean (default: false)",
                                description: "whether to loop the songs forever, useful for ad reads or throwing to break or something. will change songs when it next starts (active in OBS) and requires a song that is edited so it can loop properly"
                            }
                        ]
                    },
                    {
                        name: "Ingame Comms",
                        path: "/ingame-comms",
                        params: [
                            {
                                name: "text",
                                type: "string (default: 'Listen In')",
                                description: "text to show when listening in to a team"
                            },
                            {
                                name: "buffer",
                                type: "number (default: 0)",
                                description: "audio buffer length in milliseconds. can be 0 if on an observer / non-delayed stream, but should be the delay between live and the feeds so it becomes in sync with the gameplay."
                            },
                            {
                                name: "team",
                                type: "number",
                                description: "force a team to always be unmuted"
                            }
                        ]
                    },
                    {
                        name: "Team Audio",
                        path: "/team-audio",
                        params: [
                            {
                                name: "key",
                                type: "String",
                                description: "task key (team1 / team2 / casters)"
                            },
                            {
                                name: "buffer",
                                type: "number (default: 0)",
                                description: "audio buffer length in milliseconds. can be 0 if on an observer / non-delayed stream, but should be the delay between live and the feeds so it becomes in sync with the gameplay."
                            }
                        ]
                    }
                ]
            },
            {
                title: "Routes without query options",
                routes: [
                    {
                        name: "Break Bar",
                        path: "/break-bar",
                        description: "break components that show as a lower third, good for overlaying on videos or to have a video in the upper section"
                    },
                    {
                        name: "Season History",
                        path: "/season-history",
                        description: "shows both teams' full match history across an event"
                    },
                    {
                        name: "Thumbnail",
                        path: "/thumbnail",
                        description: "thumbnail generator for an event"
                    },
                    {
                        name: "Custom",
                        path: "/custom",
                        description: "\"empty\" generic overlay, use title string param to set the title, then you can overlay anything into the body. you will likely want to use noAnimate=true and an external stinger so there's no animations when you're overlaying content onto it"
                    },
                    {
                        name: "Info",
                        path: "/info",
                        description: "small text with event logo on the left side, good for replay/highlights/other stream bugs"
                    },
                    {
                        name: "Sponsors",
                        path: "/sponsors",
                        description: "rotating sponsors display, fills full screen"
                    },
                    {
                        name: "Persistent Sponsors",
                        path: "/logos",
                        description: "non-rotating (stacked/side-by-side) sponsors display, fills full screen"
                    },
                    {
                        name: "Branding",
                        path: "/branding",
                        description: "team branding display, uses broadcast.highlighted_team"
                    },
                    {
                        name: "Staff",
                        path: "/staff",
                        description: "shows all staff listed associated with an event (through matches.casters or matches.player_relationships, and any staff/player_rels of the event itself)"
                    },
                    {
                        name: "Desk Cams",
                        path: "/cams/desk",
                        description: "2 rows of team player cams in a generic overlay"
                    },
                    {
                        name: "Ingame Cams",
                        path: "/cams/ingame",
                        description: "ingame POV player cam (for observers)"
                    },
                    {
                        name: "Match Overview",
                        path: "/overview",
                        description: "uses the desk match score and the maps display to show all of the match's info. good for observer-only feeds instead of the break scene."
                    },
                    {
                        name: "Media Player",
                        path: "/media",
                        description: "embedded YouTube player that uses event.news items with YT embed URLs on broadcast.highlight_media. autoplays when active in OBS"
                    },
                    {
                        name: "Desk Graphics",
                        path: "/desk-graphics",
                        description: "overlay for an external screen (on the front of a desk or behind casters etc) that can show team or event logos, or sponsors. controlled by broadcast.desk_graphics_display"
                    },
                    {
                        name: "Stinger",
                        path: "/stinger",
                        description: "empty overlay that just has a stinger. useful if you want the stinger decoupled from the overlays themselves (to help with resources or for non-SLMN.GG displays like image assets etc)"
                    },
                    {
                        name: "Map Stats",
                        path: "/map-stats",
                        description: "uses the broadcast.map_set and event.map_pool to show the match's teams' map statistics against each other"
                    }
                ]
            },
            {
                title: "Useful things for production staff",
                routes: [
                    {
                        name: "Media Clock",
                        path: "/clock",
                        description: "Shows current time & duration/elapsed for media playing through /media"
                    },
                    {
                        name: "Client Overview",
                        path: "/admin",
                        description: "Shows all overlays currently loaded by the client with reload buttons"
                    },
                    {
                        name: "Syncer",
                        path: "/syncer",
                        description: "Embedded syncer.live & broadcast overlay that can be remotely turned on and off by a producer"
                    },
                    {
                        name: "Tally Viewer",
                        path: "/tally-viewer",
                        description: "Tally viewer for observers to show when they are live, also shows observer number, producer scenes & game info"
                    },
                    {
                        name: "Tally Dot",
                        path: "/tally-dot",
                        description: "Frame for an observer feed to show their number, name and live status",
                        params: [
                            {
                                name: "number",
                                alt: ["num"],
                                type: "Number",
                                description: "observer number to show (usually 1-4)"
                            }
                        ]
                    },
                    {
                        name: "Quad Tally Dot",
                        path: "/quad",
                        description: "2x2 set of Tally Dot frames, good for a multiview"
                    },
                    {
                        name: "Tally Transmitter",
                        path: "/tally-transmitter",
                        description: "Deprecated OBS transmitter for observer tally highlighting (transmitter goes on an ingame scene and transmits when active). Use the Websocket Transmitter for better results",
                        params: [
                            {
                                name: "number",
                                alt: ["num"],
                                type: "Number",
                                description: "observer number to act as (usually 1-4)"
                            }
                        ]
                    },
                    {
                        name: "Websocket Transmitter",
                        path: "/websocket-transmitter",
                        description: "Connection from OBS Websocket to SLMN.GG. Used for Observer tally lights and other systems. Make sure your observing scene names contain \"obs\" or \"game\" and an observer number",
                        params: [
                            {
                                name: "url",
                                type: "URL (default: ws://127.0.0.1:4455)",
                                description: "Websocket URL with port to connect to."
                            },
                            {
                                name: "password",
                                type: "String",
                                description: "Websocket password from OBS"
                            }
                        ]
                    }
                ]

            }
        ],
        search: ""
    }),
    computed: {
        filteredGroups() {
            return this.groups.map(group => {
                return {
                    title: group.title,
                    routes: group.routes.filter(route => {
                        return route.name.toLowerCase().includes(this.search.toLowerCase()) ||
                            route.path.toLowerCase().includes(this.search.toLowerCase()) ||
                            (route.description && route.description.toLowerCase().includes(this.search.toLowerCase())) ||
                            (route.params && route.params.some(param => {
                                return param.name.toLowerCase().includes(this.search.toLowerCase()) ||
                                    (param.alt && param.alt.some(alt => alt.toLowerCase().includes(this.search.toLowerCase()))) ||
                                    param.type.toLowerCase().includes(this.search.toLowerCase()) ||
                                    param.description.toLowerCase().includes(this.search.toLowerCase());
                            }));
                    })
                };
            });
        }
    },
    head() {
        return {
            title: "Broadcast Routes"
        };
    }
};
</script>
