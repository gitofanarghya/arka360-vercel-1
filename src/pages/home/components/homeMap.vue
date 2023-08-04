<template>
    <!-- <div id="homeMap">
        <div id="mapWrapper">
            <GmapMap
                ref="gmap"
                :center="center"
                :zoom="zoom"
                :min-zoom="minZoom"
                :disable-default-ui="true"
                style="width: 100%;height:100%;"
                @click="infoWindowCloser">
                <gmap-info-window
                    :options="infoOptions"
                    :position="infoWindowPos"
                    :opened="infoWinOpen"
                    @closeclick="infoWinOpen=false">
                    <div class="infoWindowWrapper">

                        <p style="font-weight: 400;margin-bottom: 0px;color: grey;"> Project Name </p>
                        <p style="font-size: 16px;font-weight: 400;margin-top: 5px;"> {{ infoContent.projectName }} </p>
                        <div class="allPagesIcons">
                            <button
                                class="el-icon-edit"
                                style="right: -13px"
                                @click="leadToProject"/>
                            <button
                               @click="deleteProject"
                               class="el-icon-delete"/>
                            <button
                               @click="shareProject" 
                               class="el-icon-share"/>
                        </div>

                    </div>

                </gmap-info-window>

                <GmapMarker
                    v-for="(m,i) in allProjects"
                    :key="i"
                    :position="m.position"
                    :clickable="true"
                    @click="toggleInfoWindow(m,i)"/>
            </GmapMap>

        </div>
    </div> -->
    <div id="homeMap">
        <GoogleMaps
            :center="center"
            :zoom="zoom"
            :mapOptions="mapOptions"
            :allProjects="allProjects"
            :infoWindowContent="this.$refs['info-window-content']"
            v-if="isMounted"
            @changeActiveProject="changeActiveProject"
        />
        <div style="display: none;">
            <div ref="info-window-content" class="infoWindowWrapper">
                <p style="font-weight: 400;margin-bottom: 0px;color: grey;"> Project Name </p>
                <p style="font-size: 16px;font-weight: 400;margin-top: 5px;"> {{ activeProject?.info?.projectName }} </p>
                <div class="allPagesIcons">
                    <button class="el-icon-edit" style="right: -13px" @click="leadToProject" />
                    <button @click="deleteProject" class="el-icon-delete" />
                    <button @click="shareProject" class="el-icon-share" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GoogleMaps from "@/components/googleMaps/GoogleMaps.vue"

const mapOptions = {
    streetViewControl: false,
};

export default {
    name: 'HomeMap',
    components: {
        GoogleMaps,
    },
    props: {
        allProjects: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            msg: 'I am in homeMap',
            center: { lat: 27, lng: 77 },
            zoom: 1.8,
            minZoom: 1.8,
            infoContent: {},
            infoWindowPos: null,
            infoWinOpen: false,
            currentMidx: null,
            infoOptions: {
                pixelOffset: {
                    width: 0,
                    height: -35,
                },
            },
            mapOptions,
            isMounted: false,
            activeProject: {}
        };
    },
    mounted() {
        this.isMounted = true
    },
    // computed: {
    //     markerPositions() {
    //         return this.allProjects.map(proj => proj.position)
    //     }
    // },
    updated() {
        this.zoom = 1.8;
    },
    watch: {
        allProjects: function(newVal, oldVal) {
            this.infoWinOpen = false;
            this.allProjects = newVal;
        }
    },
    methods: {
        infoWindowCloser() {
            this.infoWinOpen = false;
        },
        toggleInfoWindow(marker, idx) {
            if(this.infoWinOpen) {
                this.infoWinOpen = false;
                return
            }
            this.infoWindowPos = marker.position;
            this.infoContent = marker.info;

            // check if its the same marker that was selected if yes toggle
            if (this.currentMidx === idx) {
                this.infoWinOpen = !this.infoWinOpen;
            }
            // if different marker set info window to open and reset current marker index
            else {
                this.infoWinOpen = true;
                this.currentMidx = idx;
            }
        },
        changeActiveProject(proj) {
            this.activeProject = proj
        },
        leadToProject() {
            // current opened info bar will have data of infoContent
            const { projectId } = this.activeProject.info;
            if (typeof projectId !== 'undefined' && projectId !== null) {
                this.$router.push({ name: 'projectSummary', params: { projectId } });
            }
            else {
                // error notification
                this.$message({
                    showClose: true,
                    message: 'Error in navigating. Try Again.',
                    type: 'error',
                    center: true
                });
            }
        },
        deleteProject() {
            const { projectId } = this.activeProject.info;
            let project = { id: projectId }
            this.$emit("deleteProject", project)
        },
        shareProject() {
            const { projectId } = this.activeProject.info;
            let project = { id: projectId }
            this.$emit("shareProject", project)
        }
    },
};
</script>


<style type="text/css" scoped>

#homeMap {
    width: 100%;
    height: 100%;
}

.vue-map button img {
    margin: 0 !important;
}

#homeMap #mapWrapper {
    background-color: #cbe5f8;
    width: 100%;
    height: 100%;
    display: block;
}

.allPagesIcons {
    float : left;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.allPagesIcons button {
    background-color: transparent !important;
    border: none !important;
    margin: 0;
    cursor: pointer;
    font-size: 23px;
    padding: 8px;
}

.gm-control-active img {
    margin: 11px !important;
}

#homeMap .displayOutput p {
    border: none;
    font-size: 12px;
    padding: 5px;
    color: #000000;
    box-sizing: content-box;
    text-align: left;
    white-space:nowrap;
    text-overflow: ellipsis !important;
}

#homeMap .infoWindowWrapper {
    text-align: left;
    margin: 7px !important;
}

#homeMap >>> .gm-ui-hover-effect {
    position: absolute !important;
    right: -2px !important;
}

#homeMap >>> .gm-style .gm-style-iw-c {
    position: absolute;
    box-sizing: border-box;
    overflow: hidden;
    top: 0;
    left: 0;
    transform: translate(-50%,-100%);
    background-color: white;
    border-radius: 8px;
    padding: 0px;
    box-shadow: 0 2px 7px 1px rgba(0,0,0,0.3);
    min-width: 200px !important;
}

#homeMap >>> .gm-style .gm-style-iw-d {
    overflow: auto;
    width: auto;
    height: auto;
}

.el-icon-edit:hover {
    color: #409eff;
}

.el-icon-edit:focus {
    outline: none;
}

</style>
