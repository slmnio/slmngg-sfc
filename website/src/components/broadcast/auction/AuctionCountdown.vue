<template>
    <transition name="fade-down">
        <div class="countdown-holder" v-show="countdownLeft || web" :class="{'web': web}">
            <div class="countdown">
                <div class="countdown-bar-text" style="font-variant-numeric: tabular-nums">{{ humanText }} {{ (showTime && countdownLeft) ? (countdownLeft / 1000).toFixed(1) : ''}}</div>
                <div class="countdown-bar" :style="{ width: `${this.barWidth}%` }"></div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "AuctionCountdown",
    props: {
        web: Boolean,
        showTime: Boolean
    },
    data: () => ({
        countdownLeft: 0,
        countdownMax: 0,
        auctionState: "---"
    }),
    computed: {
        barWidth() {
            if (!this.countdownMax) return 0;
            return (this.countdownLeft / this.countdownMax) * 100;
        },
        humanText() {
            if (this.auctionState === "IN_ACTION") return "AUCTION LIVE";
            if (this.auctionState === "PRE_AUCTION") return "AUCTION STARTING...";
            if (this.auctionState === "POST_AUCTION") return "AUCTION COMPLETE";
            if (this.auctionState === "READY") return "AUCTION";
            if (this.auctionState === "RESTRICTED") return "AUCTION";
            return "AUCTION";
        }
    },
    sockets: {
        auction_state({ state }) {
            this.auctionState = state;
        },
        auction_timer(timer) {
            console.log("Auction timer now ends ", timer);
            this.countdownMax = timer.duration;
            this.countdownLeft = timer.duration;
        }
    },
    mounted() {
        setInterval(() => {
            if (this.countdownLeft <= 0) {
                this.countdownLeft = 0;
                return;
            }
            this.countdownLeft -= 100;
        }, 100);
    }
};
</script>

<style scoped>
.countdown-holder {
    width: 100%;
    background-color: rgba(255,255,255,0.5);
    color: black;
    position: absolute;
    top: 0;
    font-size: 32px;
    height: 1.5em;
}
.countdown-holder.web {
    font-size: 24px;
}

.countdown-bar {
    background: rgba(255,255,255,0.4);
    height: 100%;
    transition: width 100ms linear;
}

.countdown {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.countdown-bar-text {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    font-weight: bold;
    text-transform: uppercase;
}
</style>
