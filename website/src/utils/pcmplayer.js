function PCMPlayer(option) {
    this.init(option);
}

PCMPlayer.prototype.init = function(option) {
    const defaults = {
        encoding: "16bitInt",
        channels: 1,
        sampleRate: 8000,
        flushingTime: 1000
    };
    this.option = Object.assign({}, defaults, option);
    this.createContext();
};


PCMPlayer.prototype.createContext = function() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(this.audioCtx.destination);
    this.startTime = this.audioCtx.currentTime;
};


PCMPlayer.prototype.feed = function({ channelData, length }) {
    const audioSrc = this.audioCtx.createBufferSource();
    const audioBuffer = this.audioCtx.createBuffer(this.option.channels, length, this.option.sampleRate);

    for (let c = 0; c < this.option.channels; c++) {
        if (audioBuffer.copyToChannel) {
            audioBuffer.copyToChannel(channelData[c], c);
        } else {
            console.log("copyToChannel not supported");
            const audioData = audioBuffer.getChannelData(c);
            for (let i = 0; i < channelData[c].byteLength; i++) {
                audioData[i] = channelData[c][i];
            }
        }
    }

    if (this.startTime < this.audioCtx.currentTime) {
        this.startTime = this.audioCtx.currentTime;
    }

    audioSrc.buffer = audioBuffer;
    audioSrc.connect(this.gainNode);
    audioSrc.start(this.startTime);
    this.startTime += audioBuffer.duration;
};

PCMPlayer.prototype.destroy = function() {
    if (this.interval) {
        clearInterval(this.interval);
    }
    this.samples = null;
    this.audioCtx.close();
    this.audioCtx = null;
};
