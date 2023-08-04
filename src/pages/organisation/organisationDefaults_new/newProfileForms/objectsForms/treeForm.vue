<template>
    <div id="treeForm">
        <VuePerfectScrollbar class="scroll-area">
            <el-form
                :model="profileData.drawing_defaults.tree"
                :label-position="labelPosition"
                size="mini"
                class="formContainer">
                <!-- <p class="formHeadings">PROPERTIES</p> -->
                <el-form-item label="Trunk Height">
                    <input-length
                        v-model="profileData.drawing_defaults.tree.trunkHeight"
                        :name="'Trunk Height'"
                        :metric-validation="trunkHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Trunk Height') }}</span></p>
                </el-form-item>
                <el-form-item label="Crown Height">
                    <input-length
                        v-model="profileData.drawing_defaults.tree.crownHeight"
                        :name="'Crown Height'"
                        :metric-validation="crownHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Crown Height') }}</span></p>
                </el-form-item>
            </el-form>
            <div>
                <el-switch
                    v-model="isProportional"
                    @change="onClickPropButton()"
                    inactive-text="Enhanced Visualization in 3D">
                </el-switch>
            </div>
            <div class="flexContainer">
                <div class='cards' @click="onClickTree(1)">
                    <img src="../../../../../assets/img/Mask Group 15.png" :class="['imgs', treeId === 1 ? 'imgActive': '' ]" />
                    <p class="treeName">Small Oak</p>
                    <p class="activeCard" v-if="treeId === 1">✔</p>
                </div>
                <div class='cards' @click="onClickTree(2)">
                    <img src="../../../../../assets/img/Mask Group 11.png" :class="['imgs', treeId === 2 ? 'imgActive': '' ]" />
                    <p class="treeName">Birch</p>
                    <p class="activeCard" v-if="treeId === 2">✔</p>
                </div>
                <div class='cards' @click="onClickTree(3)">
                    <img src="../../../../../assets/img/Mask Group 13.png" :class="['imgs', treeId === 3 ? 'imgActive': '' ]" />
                    <p class="treeName">Branched</p>
                    <p class="activeCard" v-if="treeId === 3">✔</p>
                </div>
                <div class='cards' @click="onClickTree(4)">
                    <img src="../../../../../assets/img/Mask Group 14.png" :class="['imgs', treeId === 4 ? 'imgActive': '' ]" />
                    <p class="treeName">Pine</p>
                    <p class="activeCard" v-if="treeId === 4">✔</p>
                </div>
                <div class='cards' @click="onClickTree(5)"> 
                    <img src="../../../../../assets/img/apple.png" :class="['imgs', treeId === 5 ? 'imgActive': '' ]" />
                    <p class="treeName">Apple</p>
                    <p class="activeCard" v-if="treeId === 5">✔</p>
                </div>
                <div class='cards' @click="onClickTree(6)">
                    <img src="../../../../../assets/img/Mask Group 12.png" :class="['imgs', treeId === 6 ? 'imgActive': '' ]" />
                    <p class="treeName">Palm</p>
                    <p class="activeCard" v-if="treeId === 6">✔</p>
                </div>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
    name: 'TreeForm',
    components: {
        VuePerfectScrollbar,
    },
    props: ['profileData', 'profileData.drawing_defaults.tree'],
    data() {
        return {
            treeId: 1,
            isProportional: false,
            labelPosition: 'left',
            treeProp: {
                trunkHeight: 10,
                crownHeight: 4,
            },
            trunkHeightValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            crownHeightValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
        };
    },
    computed: {
    },
    mounted() {
        if (this.profileData.drawing_defaults.tree.treeId) {
            this.treeId = this.profileData.drawing_defaults.tree.treeId;
        }
        else {
            this.treeId = 1;
            this.profileData.drawing_defaults.tree.treeId = this.treeId;
        }
        if (this.profileData.drawing_defaults.tree.isProportional) {
            this.isProportional = this.profileData.drawing_defaults.tree.isProportional;
        }
        else {
            this.isProportional = false;
            this.profileData.drawing_defaults.tree.isProportional = this.isProportional;
        }
    },
    methods: {
        onClickPropButton() {
            this.profileData.drawing_defaults.tree.isProportional = this.isProportional;
        },
        onClickTree(val) {
            this.treeId = val;
            this.profileData.drawing_defaults.tree.treeId = this.treeId;
        }
    },
};
</script>

<style type="text/css">
.note{
  margin-top: 24px;
  font-size:14px;
}

#newProfile .el-dialog__body {
    text-align: left
}

.formHeadings {
        color: #606266;
        font-size: 16px;
        font-family: "Helvetica Neue";
        text-align: left;
        padding-bottom: 14px;
        padding-top: 0px;
        font-weight: 600;
    }
#treeForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
}
.inputBoxStyler {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 2px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 28px;
    line-height: 28px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 90%;
    font-size: 12px;
}
#treeForm  .el-form-item__label {
    text-align: left;
    vertical-align: middle;
    float: left;
    font-size: 16px !important;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;}
</style>

<style scoped>
.formErrors{font-size: 13px;
color: red;}
#treeForm >>> .el-form-item--mini.el-form-item {
    margin-bottom: 1px;
}#treeForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
.toggleHeading {
    font-size: 16px;
    color: #222;
}

.flexContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 24px;
}

.cards {
    position: relative;
    cursor: pointer;
}

.activeCard {
    position: absolute;
    top: 6px;
    right: 6px;
    height: 18px;
    width: 18px;
    border: 1px solid #fff;
    background-color: #409eff;
    color: #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 11px;
}

.imgActive {
    border: 2px solid #409eff;
    border-radius: 11px;
}

.treeName {
    font-size: 14px;
    color: #222;
    margin-top: 8px;
    text-align: center;
}

.formContainer {
    display: flex;
    align-items: center;
    column-gap: 40px;
    row-gap: 24px;
}
.imgs {
    width: 136px;
    height: 136px;
    border-radius: 11px;
}

#treeForm >>> .el-form-item__content .inputBoxStyler {
    height: 48px;
    border-radius: 4px;
  background-color: #f5f7fa;
  border: none;
  font-size: 16px;

}

#treeForm >>> .el-form-item__label {
    font-size: 16px;
    color: #777;
}

#treeForm >>> .el-switch {
    float: inherit;
    margin-top: 16px;
}

#treeForm >>> .el-switch__label * {
    font-size: 16px;
    color: #222;
}
</style>
