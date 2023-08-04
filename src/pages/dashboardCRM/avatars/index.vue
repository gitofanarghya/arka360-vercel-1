<template>
    <AvatarHandler :avatars="avatars" :overlap="false" :limit="2" :selectionAvatars="selectionAvatars" :removable="true" :gap="5" 
    @handleRemove="handleRemove" @handleAdd="handleAdd" :imgWidth="30" :fontSize="'14px'"/>
</template>
<script>
import AvatarHandler from './AvatarHandler.vue';
export default{
    components: {
        AvatarHandler
    },
    data(){
        return {    
            avatars: [
                {id: 1, name: 'Kaarn Kaarn' }, 
                {id: 2, name: 'Charan M1231' },  
                {id: 3, name: 'Qdasdsa Adasdasd' },  
            ],
            selectionAvatars: [
                {id: 1, name: 'Kaarn Kaarn' }, 
                {id: 2, name: 'Charan M1231' },  
                {id: 3, name: 'Qdasdsa Adasdasd' },  
                {id: 4, name: 'Adasd Adsad' },  
                {id: 5, name: 'Cdasdsaads Bsaddsa' },  
                {id: 6, name: 'Sasdsadsda Sdasdsadas' },  
                {id: 7, name: 'Ussssss Asdadsa' },
            ]
        }
    },
    methods: {
        handleRemove(id){
            let filteredArr = this.avatars.filter(e => e.id !== id)
            this.avatars = filteredArr
        },
        handleAdd(id){
            let ele = this.selectionAvatars.find(e => e.id === id)
            this.avatars.push(ele)
        }
    }
}
</script>