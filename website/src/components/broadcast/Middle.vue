<template>
        <div class="centerer">
            <div class="middle-holder flex-center">
                <div class="middle">{{ text }}</div>
            </div>
        </div>
</template>

<script>
export default {
    name: "Middle",
    props: ["text"]
};
</script>

<style scoped>
.centerer {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    top: -10px;
    pointer-events: none;
}

.middle-holder {
    overflow: hidden;
    white-space: nowrap;
    width: 450px;
}

.middle {
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: .0em .5em;
    font-size: 24px;
    display: inline-flex;
}

.mid-leave-active,
.mid-leave-active .middle-holder { transition: all .5s ease-in-out/* .5s*/; }

.mid-enter-active,
.mid-enter-active .middle-holder { transition: all .5s ease-in-out .25s; }

.mid-enter-to .middle-holder, .mid-leave .middle-holder { width: 450px; }
.mid-enter .middle-holder, .mid-leave-to .middle-holder { width: 0; }
</style>
