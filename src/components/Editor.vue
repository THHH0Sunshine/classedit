<template>
  <div>
    <el-upload
      action=""
      accept=".class"
      :http-request="upload">
      <el-button size="small" type="primary">Upload Class File...</el-button>
    </el-upload>
    <constant-pool
      v-if="parsedClassFile"
      :constant_pool="parsedClassFile.constant_pool">
    </constant-pool>
  </div>
</template>

<script>
import ConstantPool from './ConstantPool.vue'
import { parseClassFileArrayBuffer } from '@/js/cfparser.js'

export default {
  name: 'Editor',
  components: {
    ConstantPool,
  },
  data() {
    return {
      parsedClassFile: null,
    }
  },
  methods: {
    upload(o) {
      let reader = new FileReader()
      reader.onload = (e => (this.parsedClassFile = parseClassFileArrayBuffer(e.target.result)))
      reader.readAsArrayBuffer(o.file)
    },
  },
}
</script>