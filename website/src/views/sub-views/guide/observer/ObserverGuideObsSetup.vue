<template>
    <div>
        <h2>
            Setting up OBS
        </h2>
        <p>
            Download OBS Studio <a target="_blank" href="https://obsproject.com/download">here</a>. If you already have
            OBS
            installed, make sure it's up to date.
        </p>
        <b-alert :model-value="true" variant="warning">
            Do not use Streamlabs Desktop or OBS.Live.
        </b-alert>
        <h3>
            Stream settings
        </h3>
        <p>
            In OBS, create a new profile and close the auto-configuration wizard. Open the settings by clicking on
            <strong>File > Settings</strong>.
        </p>

        <b-alert :model-value="true">Go to each of the tabs below and change the settings mentioned here.</b-alert>

        <h4>Stream</h4>

        <ul>
            <li><strong>Service</strong>: Custom</li>
            <li>
                <strong>Server</strong>:
                <ul>
                    <li>Use the <strong><code>/srt</code></strong> command in Discord to generate a URL</li>
                    <li>Your producer will tell you which region to use</li>
                    <li>If your internet is unreliable, you can increase the latency from 500 to 1500 or more</li>
                    <li>Make sure to use the <strong>Observer</strong> URL</li>
                </ul>
            </li>
            <li>
                <strong>Stream Key</strong>: Leave empty
            </li>
            <li>
                <strong>Use Authentication</strong>: Unchecked
            </li>
        </ul>

        <h4>Output</h4>

        <p>
            Change the <strong>Output Mode</strong> to <strong>Advanced</strong>.
            Now take a look at your available options for <strong>Video Encoder</strong>.
            The more left they are on the list below, the better they are.
        </p>


        <b-tabs content-class="mt-3">
            <b-tab title="NVIDIA NVENC HEVC" active>
                <p>
                    This is the best option. It'll use less network bandwidth and give you better quality.
                </p>

                <ul>
                    <li><strong>Rate Control</strong>: CBR</li>
                    <li><strong>Bitrate</strong>: 6000</li>
                    <li><strong>Preset</strong>: P5: Slow (Good Quality)</li>
                    <li><strong>Tuning</strong>: Ultra Low Latency</li>
                </ul>

                <p>
                    Leave the rest as default.
                </p>
            </b-tab>
            <b-tab title="AMD HW H.265 (HEVC)">
                <p>
                    This is the best option. It'll use less network bandwidth and give you better quality.
                </p>

                <ul>
                    <li><strong>Rate Control</strong>: CBR</li>
                    <li><strong>Bitrate</strong>: 6000</li>
                    <li><strong>Preset</strong>: Speed</li>
                </ul>

                <p>
                    Leave the rest as default.
                </p>
            </b-tab>
            <b-tab title="NVIDIA NVENC H.264">
                <p>
                    This is the second-best option. It'll use more network bandwidth and give you worse quality.
                </p>

                <ul>
                    <li><strong>Rate Control</strong>: CBR</li>
                    <li><strong>Bitrate</strong>: 12000</li>
                    <li><strong>Preset</strong>: P5: Slow (Good Quality)</li>
                    <li><strong>Tuning</strong>: Ultra Low Latency</li>
                </ul>

                <p>
                    Leave the rest as default.
                </p>
            </b-tab>
            <b-tab title="AMD HW H.264 (AVC)">
                <p>
                    This is the second-best option. It'll use more network bandwidth and give you worse quality.
                </p>

                <ul>
                    <li><strong>Rate Control</strong>: CBR</li>
                    <li><strong>Bitrate</strong>: 12000</li>
                    <li><strong>Preset</strong>: Speed</li>
                </ul>

                <p>
                    Leave the rest as default.
                </p>
            </b-tab>
            <b-tab title="x264">
                <p>
                    Only use this if you have a very good CPU and no better options.
                    It'll stress your CPU a lot and give you worse quality.
                </p>

                <ul>
                    <li><strong>Rate Control</strong>: CBR</li>
                    <li><strong>Bitrate</strong>: 6000 - 12000, depending on what your CPU can handle</li>
                    <li><strong>CPU Usage Preset</strong>: veryfast</li>
                    <li><strong>Tune</strong>: zerolatency</li>
                </ul>

                <p>
                    Leave the rest as default.
                </p>
            </b-tab>
        </b-tabs>

        <h4>Video</h4>

        <ul>
            <li>
                <strong>Base (Canvas) Resolution</strong>: 1920x1080
            </li>
            <li>
                <strong>Output (Scaled) Resolution</strong>: 1920x1080
            </li>
            <li>
                <strong>FPS</strong>: 60
            </li>
        </ul>

        <h4>Audio</h4>

        <ul>
            <li><strong>Global Audio Devices</strong>: Set all devices to Disabled</li>
        </ul>
    </div>
</template>

<script>

export default {
    name: "GuideObsSetup"
};
</script>
