<template>
    <div class="overlay">
        <div class="progress-bar">
            <svg class="progress" :data-progress="progressBarValue" x="0px" y="0px" viewBox="0 0 80 80">
                <path class="track" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
                <path class="fill" d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0" />
                <text class="valueProgressBar" x="50%" y="57%">0%</text>
            </svg>
            <p class="videoMsg" id="progressText">Please remain on this page until the video recording is complete.</p>
            <!-- <p class="videoMsg">Please do not close or minimise this window</p> -->
        </div>
    </div>
</template>



<script>
export default {

    data() {
        return {
            progressBarValue: 0,
            textInterval: null,
            progressInterval: null,
        }
    },

    mounted() {
        this.progressBarFunc();
        this.startFakeProgressBar();
    },
    beforeDestroy() {
        console.log('beforeDestroy: ');
        clearInterval(this.progressInterval)
    },

    methods: {
        progressBarFunc() {
            var max = -219.99078369140625;
            let value = document.querySelectorAll('.progress')[0];
            let percent = value.getAttribute('data-progress');
            value.querySelector('.fill').setAttribute('style', 'stroke-dashoffset: ' + ((100 - percent) / 100) * max);
            value.querySelector('.valueProgressBar').innerHTML = parseInt(percent) + '%';
        },
        startFakeProgressBar() {
            this.progressBarValue = 0;
            let approxTime = 60 // seconds
            let refreshRate = 4000 // milliseconds
            let maxPer = 99 // percentage
            let i = 0;
            let textBox = document.getElementById('progressText')
            let progressTexts = [
                "Stay on this page while the video recording is in progress to avoid any interruptions.",
                "Solar panels need a little time to shine. Please hold...",
                "Please maximise your current tab to get best results!",
                "Creating a video that's as cool as the other side of the solar panel. Loading...",
                "Recording the sun's rays in action. It's like catching lightning in a bottle!",
                "Your solar design is worth the wait. We promise!",
                "Our solar ninjas are crafting your video with precision and care. Hang in there!",

            ]
            this.progressInterval = setInterval(() => {
                let curProg = this.progressBarValue
                let newProg = Math.min(curProg + maxPer / (approxTime / (refreshRate / 1000)), maxPer)
                this.progressBarValue = newProg;
                this.progressBarFunc();
                textBox.innerHTML = progressTexts[i]
                if( i >= 6){
                    i = 0;
                }else{
                    i++;
                }
            }, refreshRate);
            
        },

        stopFakeProgressBar() {
            console.log('stop');
            this.progressBarValue = 100;
            clearInterval(this.progressInterval)
        }
    }
}
</script>


<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    backdrop-filter: blur(1px);
    background-color: rgba(0, 0, 0, 0.85);
    display: grid;
    place-items: center;
}

.progress-bar {
    width: 239px;
    height: 239px;
    text-align: center;
}

.progress {
    width: 239px;
    height: 239px;
    z-index: 1;
}

.progress .track,
.progress .fill {
    fill: rgba(0, 0, 0, 0);
    stroke-width: 6;
    transform: rotate(90deg)translate(0px, -80px);
}

.progress .track {
    stroke: #444;
}

.progress .fill {
    stroke: #008eff;
    stroke-dasharray: 219.99078369140625;
    stroke-dashoffset: -219.99078369140625;
    transition: stroke-dashoffset 1s;
}

.progress .valueProgressBar {
    fill: #fff;
    text-anchor: middle;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    text-align: center;
}

.progress .text {
    font-size: 12px;
    fill: #fff;
    text-anchor: middle;
}

.videoMsg {
    font-size: 18px;
    font-weight: 500;
    color: #fff;
    margin-top: 32px;
}</style>