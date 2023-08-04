<!-- UNUSED FILE -->
<script>
import { HorizontalBar } from 'vue-chartjs';

export default {
    extends: HorizontalBar,
    props: {
        probabilty_distribution: {
            type: Object,
            default: () => {},
        },
        options: {
            type: Object,
            default: () => {
                return {
                    fontSize: 11,
                    yOffset: 8,
                    xOffset: 85,
                    barThickness: 16,
                }
            },
        }
    },
    methods: { 
        async render() {
        var img = document.createElement("img");
       document.getElementsByClassName("lossDiagramWrapperDiv")[0].appendChild(img)

     },
    },
    mounted() {
            this.render();
            
    },
    watch: {
        lossData: {
            deep: true,
            handler(value) {
                this.render();
            },
        }
    },
};

</script>
