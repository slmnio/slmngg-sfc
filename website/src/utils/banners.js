class Banner {
    constructor(options) {
        this.options = options;
        this.name = options.name;

        this.source = {
            original: options.svg.slice(),
            current: options.svg.slice(),
            customized: false
        };
        this.text = {
            player: "Player",
            subtitle: null
        };
        this.logo = null;

        this.lastOptions = null;
    }

    customize(options) {
        console.log("customizing", options);
        if (this.lastOptions) {
            if (JSON.stringify(options) === this.lastOptions) return console.warn("Muffle - last request is the same");
        }
        this.source.current = this.source.original.slice();

        if (options.background) this.source.current = this.source.current.replaceAll("--background--", options.background);
        if (options.accent) this.source.current = this.source.current.replaceAll("--accent--", options.accent);
        if (options.textColor) this.textColor = options.textColor;
        if (options.background || options.accent) this.source.customized = true;

        if (options.logo) {
            this.logo = options.logo;
            console.log("logo", options.logo);
        }
        if (options.theme) console.warn("options.theme is deprecated. use background or accent");

        if (options.text) this.text.player = options.text;
        this.text.subtitle = options.subtitle || null;

        this.lastOptions = JSON.stringify(options);
        return this;
    }

    getSource() {
        if (!this.source.customized) this.customize({ accent: "#66D9FF", background: "#111111" });
        // console.log(this.source.current);
        return this.source.current;
    }

    drawText(canvas) {
        const ctx = canvas.getContext("2d");

        if (this.text.player && this.options.text.player) {
            const p = this.options.text.player;
            ctx.font = `900 ${p.fontSize}px SLMN-Industry`;
            ctx.fillStyle = this.textColor || p.color;
            ctx.textAlign = "center";
            // console.log(p, p.position);
            ctx.fillText(this.text.player.toUpperCase(), ...p.position);
        }
        if (this.text.subtitle && this.options.text.subtitle) {
            const p = this.options.text.subtitle;
            ctx.font = `900 ${p.fontSize}px SLMN-Industry`;
            ctx.fillStyle = this.textColor || p.color;
            ctx.textAlign = "center";
            console.log(p, p.position);
            ctx.fillText(this.text.subtitle.toUpperCase(), ...p.position);
        }
    }

    async drawLogo(canvas) {
        return new Promise((resolve) => {
            const ctx = canvas.getContext("2d");

            if (this.options.logo && this.logo) {
                const logo = new Image();
                logo.crossOrigin = "anonymous";
                logo.onload = () => {
                    // console.log(logo.width, logo.height);
                    if (this.options.logo.autoHeightFromWidth) {
                        let [left, top] = this.options.logo.position;

                        const width = this.options.logo.autoHeightFromWidth;
                        const height = (logo.height / logo.width) * width;


                        // console.log({
                        //     width,
                        //     height,
                        //     offset: (width - height)
                        // });

                        top += (width - height) / 2;

                        ctx.drawImage(logo, left, top, width, height);
                    } else if (this.options.logo.autoHeight_centered) {
                        // | <---> logo <---> |

                        let [left, top] = this.options.logo.position;
                        const height = this.options.logo.autoHeight_centered;
                        const width = (logo.width / logo.height) * height;

                        left = (1500 - width) / 2;
                        ctx.drawImage(logo, left, top, width, height);
                    } else {
                        ctx.drawImage(logo, ...this.options.logo.position);
                    }
                    resolve();
                };
                logo.src = this.logo;
            } else {
                resolve();
            }
        });
    }

    drawImage(canvas) {
        return new Promise(resolve => {
            const svg64 = btoa(this.getSource());
            const b64Start = "data:image/svg+xml;base64;charset=utf-8,";
            const image64 = b64Start + svg64.replaceAll("#", "%23");

            const img = new Image();
            img.onload = async () => {
                // console.log(img);
                canvas.getContext("2d").drawImage(img, 0, 0);
                this.drawText(canvas);
                await this.drawLogo(canvas);
                resolve(canvas.toDataURL("image/png"));
            };
            img.src = image64;
        });
    }
}


const BannerBases = {
    "Basic Glow": `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
     y="0px"
     viewBox="0 0 1500 500" width="1500" height="500" style="enable-background:new 0 0 1500 500;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:--background--;}
        .st1{fill:--accent--;}
        .st2{fill:url(#SVGID_1_);}
    </style>
        
    <g id="Background">
        <rect class="st0" width="1500" height="500"/>
    </g>
    <rect id="Stripe" y="480" class="st1" width="1500" height="20"/>
    
    <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="750" y1="488" x2="750" y2="192">
        <stop offset="0" style="stop-color:--accent--;stop-opacity:0.5"/>
        <stop offset="1" style="stop-color:--accent--;stop-opacity:0"/>
    </linearGradient>
    <rect id="Fade" y="192" class="st2" width="1500" height="296"/>
        
    <g id="layer1" transform="matrix(2.5,0,0,2.5,1469,447)" class="st1" style="fill-opacity:1">    
       <path style="stroke-width:0;stroke-dasharray:none"
             d="M 5,0 H 0 V 3 H 4 V 4 H 0 V 5 H 5 V 2 H 1 V 1 h 4 z"
             id="path1255" />
       <path style="stroke-width:0;stroke-dasharray:none"
             d="M 6,0 V 5 H 9 V 4 H 7 V 0 Z"
             id="path1257" />
       <path style="stroke-width:0;stroke-dasharray:none"
             d="m 0,6 v 4 H 1 V 7 h 1 v 3 H 3 V 7 h 1 v 3 H 5 V 6 Z"
             id="path1259" />
       <path style="stroke-width:0;stroke-dasharray:none"
             d="m 6,6 v 4 H 7 V 7 h 1 v 3 H 9 V 6 Z"
             id="path1261" />
</g>
</svg>`
};


export const AllBanners = [
    new Banner({
        svg: BannerBases["Basic Glow"],
        name: "Basic Glow (no logos)",
        text: {
            player: { color: "#ffffff", fontSize: 180, position: [750, 310, 1400] },
            subtitle: { color: "#ffffff", fontSize: 30, position: [750, 130, 1400] }
        }
    }),
    new Banner({
        svg: BannerBases["Basic Glow"],
        name: "Basic Glow (with logos)",
        text: {
            player: { color: "#ffffff", fontSize: 180, position: [750, 250, 1400] },
            subtitle: { color: "#ffffff", fontSize: 30, position: [750, 70, 1400] }
        },
        logo: {
            position: [675, 290],
            autoHeight_centered: 150
        }
    })
];


console.log(AllBanners);

function expected() {
    const banners = [];

    const userChoice = 0;
    const banner = banners[userChoice];
    banner.customise({ color: "red" });
}
