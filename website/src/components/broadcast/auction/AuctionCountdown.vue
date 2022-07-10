<template>
    <transition name="fade-down">
        <div class="countdown-holder">
            <div class="countdown">
                <div class="countdown-bar-text">Current Auction</div>
                <div class="countdown-bar" :style="{ width: `${countdownLeft / 200}%` }"></div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "AuctionCountdown",
    data: () => ({
        countdownLeft: 25000
    }),
    sockets: {
        auction_timer(timer) {
            console.log("Auction timer now ends ", timer);
            this.countdownLeft = timer.duration;
        }
    },
    mounted() {
        setInterval(() => {
            if (this.countdownLeft <= 0) return;
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

.countdown-bar {
    background: rgba(255,255,255,0.4);
    height: 100%;
    transition: width 100ms linear;
}

.countdown {
    position: relative;
    width: 100%;
    height: 100%;
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
