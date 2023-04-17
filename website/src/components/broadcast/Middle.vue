<template>
    <div class="centerer" :class="{'tiny': tiny}">
        <div class="middle-holder flex-center">
            <div class="middle">
                <div class="industry-align">{{ text }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Middle",
    props: ["text", "tiny"]
};
</script>

<style scoped>
.centerer {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    top: -12px;
    pointer-events: none;
    transition: all .2s ease-in-out;
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
    text-transform: uppercase;
    display: inline-flex;
    border-radius: 4px;
    transition: all .2s ease-in-out;
}

.mid-leave-active,
.mid-leave-active .middle-holder { transition: all .5s ease-in-out/* .5s*/; }

.mid-enter-active,
.mid-enter-active .middle-holder { transition: all .5s ease-in-out .25s; }

.mid-enter-to .middle-holder, .mid-leave .middle-holder { width: 450px; }
.mid-enter .middle-holder, .mid-leave-to .middle-holder { width: 0; }


.centerer.tiny {
    top: 3px;
}
.centerer.tiny .middle {
    font-size: 20px;
    padding: 0 .5em;
    line-height: 1.2em;
}

</style>
