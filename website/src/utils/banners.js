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
            player: "Player"
        };
        this.logo = null;
    }

    customize(options) {
        console.log("customizing", options);
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

        return this;
    }

    getSource() {
        if (!this.source.customized) this.customize({ accent: "#66D9FF", background: "#111111" });
        console.log(this.source.current);
        return this.source.current;
    }

    drawText(canvas) {
        const ctx = canvas.getContext("2d");

        if (this.text.player && this.options.text.player) {
            const p = this.options.text.player;
            ctx.font = `900 ${p.fontSize}px SLMN-Industry`;
            ctx.fillStyle = this.textColor || p.color;
            ctx.textAlign = "center";
            console.log(p, p.position);
            ctx.fillText(this.text.player.toUpperCase(), ...p.position);
        }
    }

    async drawLogo(canvas) {
        return new Promise((resolve) => {
            const ctx = canvas.getContext("2d");

            if (this.options.logo && this.logo) {
                const logo = new Image();
                logo.crossOrigin = "anonymous";
                logo.onload = () => {
                    console.log(logo.width, logo.height);
                    if (this.options.logo.autoHeightFromWidth) {
                        let [left, top] = this.options.logo.position;

                        const width = this.options.logo.autoHeightFromWidth;
                        const height = (logo.height / logo.width) * width;


                        console.log({
                            width,
                            height,
                            offset: (width - height)
                        });

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
            const b64Start = "data:image/svg+xml;base64,";
            const image64 = b64Start + svg64;

            const img = new Image();
            img.onload = async () => {
                console.log(img);
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
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
\t viewBox="0 0 1500 500" style="enable-background:new 0 0 1500 500;" xml:space="preserve">
<style type="text/css">
\t.st0{fill:--background--;}
\t.st1{fill:--accent--;}
\t.st2{fill:url(#SVGID_1_);}
</style>
<g id="Background">
\t<rect class="st0" width="1500" height="500"/>
</g>
<rect id="Stripe" y="480" class="st1" width="1500" height="20"/>
<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="750" y1="488" x2="750" y2="192">
\t<stop  offset="0" style="stop-color:--accent--;stop-opacity:0.5"/>
\t<stop  offset="1" style="stop-color:--accent--;stop-opacity:0"/>
</linearGradient>
<rect y="192" class="st2" width="1500" height="296"/>
</svg>`
};


export const AllBanners = [
    new Banner({
        svg: BannerBases["Basic Glow"],
        name: "Basic Glow (no logos)",
        text: {
            player: { color: "#ffffff", fontSize: 180, position: [750, 310, 1400] }
        }
    }),
    new Banner({
        svg: BannerBases["Basic Glow"],
        name: "Basic Glow (with logos)",
        text: {
            player: { color: "#ffffff", fontSize: 180, position: [750, 250, 1400] }
        },
        logo: {
            position: [675, 290],
            autoHeight_centered: 150
        }
    })
];


function expected() {
    const banners = [];

    const userChoice = 0;
    const banner = banners[userChoice];
    banner.customise({ color: "red" });
}
