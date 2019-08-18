<template>
  <span class="tags">
    <el-tag
      class="tag"
      v-for="(str,k) in fdisplay"
      :key="k">
      {{str}}
    </el-tag>
  </span>
</template>

<script>
import { ACCESS_FLAG } from '@/js/constants.js'

export default {
  name: 'AccessFlags',
  props: {
    access_flags: Number,
    where: Number,
  },
  computed: {
    fdisplay() {
      var rt = []
      for (var i = 0; i < 16; i++)
        if ((this.access_flags & (1 << i)) && ACCESS_FLAG[this.where][i])
          rt.push(ACCESS_FLAG[this.where][i])
      return rt
    },
  },
}
</script>

<style scoped>
.tag + .tag {
  margin-left: 10px;
}
</style>