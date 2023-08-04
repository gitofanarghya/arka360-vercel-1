<template>
    <div id="textboxSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Text Box ID
                    <span class="sappane-value">
                        {{ textBoxNumber }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TextboxSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    textBoxNumber: 0,
                };
            },
        },
    },
    computed: {
        textBoxNumber() {
            if (Array.isArray(this.summaryData.textBoxNumber)) {
                return String(this.summaryData.textBoxNumber);
            }
            return this.summaryData.textBoxNumber;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#textboxSummary ::-webkit-scrollbar {
    display: none;
}

#textboxSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#textboxSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#textboxSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>
