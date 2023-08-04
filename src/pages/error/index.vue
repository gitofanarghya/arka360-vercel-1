<template>
    <div class="error-outer-div">
        <div class="error-inner-div">
            <span class="error-heading">
                Sorry!
            </span>
            <span class="error-message">
                We can't seem to find the design you were looking for.
            </span>
            <hr class="error-horizontal-break">
            <a href="https://thesolarlabs.com">
                <img :src="arkaEnergyLogo" class="error-tsl-logo" alt="Logo" />           
            </a>
        </div>
    </div>
</template>
<script>
import { fetchArkaEnergyLogo } from "@/pages/utils/utils.js";

export default{
    data() {
        return {
            arkaEnergyLogo: fetchArkaEnergyLogo(),
            solarLabsLogo: 'https://front-end-assests.s3-us-west-2.amazonaws.com/tsl_logo.png',
        };
    },
};
</script>

<style scoped>
    .error-outer-div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background-image: url('https://front-end-assests.s3-us-west-2.amazonaws.com/solar-panels-grass.jpg');
        background-position: center;
        background-size: cover;
    }
    .error-inner-div {
            background-color: whitesmoke;
            display: flex;
            flex-direction: column;
            max-width: 500px;
            justify-content: center;
            align-items: center;
            padding: 50px;
            margin: 20px;
            border-radius: 6px;
            box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
    }
    .error-heading {
        font-size: 48px;
        line-height: 100px;
        color: #aaaaaa
    }
    .error-message {
        font-size: 32px;
        text-align: center;
    }
    .error-horizontal-break {
        max-width: 250px;
        display: block;
        height: 1px;
        width: 100%;
        margin: 24px 0;
        background-color: #DCDFE6;
        border-style: hidden;
    }
    .error-tsl-logo {
        height: 50px;
    }

    @media only screen and (max-width: 767px) {
        .error-outer-div {
            align-items: start;
        }
        .error-inner-div {
            padding: 25px;
            margin: 10px;
        }
        .error-heading {
            font-size: 24px;
            line-height: 50px;
            color: #aaaaaa
        }
        .error-message {
            font-size: 16px;
            text-align: center;
        }
        .error-tsl-logo {
            height: 30px;
        }
    }
</style>
