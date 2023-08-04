<template>
    <div>
        <div>
            <h4>Shifts</h4>
        </div>
        <TagsComponent />

        <el-button :disabled="!isSaveEnabled" @click="save">Save</el-button>
    </div>
</template>

<script>
import TagsComponent from './tagsComponent.vue';
export default {
    components: {
        TagsComponent
    },
    data() {
        return {
            shift: '',
            competency: '',
            type: '',
        };
    },
    computed: {
        isSaveEnabled() {
            return this.shift !== '' && this.competency !== '' && this.type !== '';
        },
    },
    methods: {
        updateSaveButton() {
            this.$forceUpdate(); // Forces the component to update the computed property
        },
        save() {
            // Handle the save functionality here
        },
    },
};
</script>

<