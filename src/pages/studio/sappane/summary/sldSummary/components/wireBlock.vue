<template>
    <div>
        <div class="dataProperties">
            <div class="sappane-label" style="display: flex; align-items: flex-start;"> 
                <span style="width: 35%"> DC Wire Make </span>
                <div style="padding-left:5px; display: inline-flex; width: 60%; justify-content: space-between;">
                    <el-select
                            v-model="wireMakes.dcCableMake.type"
                            class="sappane-select"
                            placeholder="Select"
                            popper-class="darkDropdown"
                            style="width: 40%">
                            <el-option
                                v-for="(wireType, index) in wireMakeTypes"
                                :key="index"
                                :label="wireType.label"
                                :value="wireType.value"/>
                    </el-select>
                    <div style="width: 50%; display:inline-flex; justify-content: space-between; align-items: baseline;">
                        <input
                            v-model.number="wireMakes.dcCableMake.size"
                            class="sappane-input-value"
                            autocomplete="off"
                            style="width: 40%"/>
                        <span style="font-size: 0.7vw">
                            {{ wireMakeUnit }}
                        </span>                
                    </div>
                </div>
            </div>
        </div>
        <div class="dataProperties">
            <div class="sappane-label" style="display: flex; align-items: flex-start;"> 
                <span style="width: 35%"> AC Wire Make </span>
                <div style="padding-left:5px; display: inline-flex; width: 60%; justify-content: space-between;">
                    <el-select
                        v-model="wireMakes.acCableMake.type"
                        class="sappane-select"
                        placeholder="Select"
                        popper-class="darkDropdown"
                        style="width: 40%">
                        <el-option
                            v-for="(wireType, index) in wireMakeTypes"
                            :key="index"
                            :label="wireType.label"
                            :value="wireType.value"/>
                    </el-select>
                    <div style="width: 50%; display:inline-flex; justify-content: space-between; align-items: baseline;">
                        <input
                            v-model.number="wireMakes.acCableMake.size"
                            class="sappane-input-value"
                            autocomplete="off"
                            style="width: 40%"/>
                        <span style="font-size: 0.7vw">
                            {{ wireMakeUnit }}
                        </span>                
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        wireMakess: {
            type: Object,
            default: () => {}
        }, 
    },
    data() {
        return {
            wireMakeTypes: [
                {
                    label: 'Cu',
                    value: 'Cu'
                },
                {
                    label: 'Al',
                    value: 'Al'
                }
            ],
            wireMakeUnit: 'Sq mm',
            wireMakes: {
                dcCableMake: {
                    type: 'Cu',
                    size: 4
                },
                acCableMake: {
                    type: 'Al',
                    size: 6
                }
            },
        }
    },
}
</script>

<style lang="scss" scoped>
@import '../../../../../../styles/components/input';
</style>
