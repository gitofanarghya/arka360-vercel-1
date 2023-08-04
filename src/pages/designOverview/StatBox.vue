<template>
    <div class="stat-box">
        <p class="stat-box-name">
            {{ statName }}
        </p>
        <p class="stat-box-value">
            {{ statValue }}
        </p>
    </div>
</template>

<script>
export default {
    name: 'StatBox',
    props: {
        statName: {
            type: String,
            default: 'Field',
        },
        statValue: {
            type: String,
            default: 'Value',
        },
    },
};
</script>

<style scoped>
    .stat-box {
        height: 85px;
        background-color: #005482;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 6px 0px 6px 0px;
        border-radius: 6px;
    }
    .stat-box-name {
        color: white;
        font-size: 16px;
        margin-bottom: 8px;
    }
    .stat-box-value {
        color: white;
        font-size: 20px;
        font-weight: 1000;
    }
</style>
