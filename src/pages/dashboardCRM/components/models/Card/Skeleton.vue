<template>
    <el-skeleton  :style="{width: width}" animated>
      <template slot="template">
        <el-skeleton-item
          variant="rect"
          :style="{height:height}"
        />
      </template>
    </el-skeleton>
</template>
<script>
    export default {
        name: 'Skeleton',
        props: {
            height: {
                type: String,
                default: '33vh'
            },
            width: {
                type: String,
                default: '100%'
            }
        }
    }
</script>