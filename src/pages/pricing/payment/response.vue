<template>
    <div>
        hello
    </div>
</template>

<script>
// import { USER_TIER } from '@/pages/constants';
import navBar from '@/components/ui/navBar/navBar.vue';
// import liteTier from './pricingTiers/liteTier.vue';
// import basicTier from './pricingTiers/basicTier.vue';


export default {
    name: 'Response',
    components: {
        navBar,
    },
    data() {
        return {
            currentPage: 'response',
        };
    },
    nonReactiveData() {
    },
    computed: {
    },
    methods: {
    },
};
</script>