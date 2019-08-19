<template>
  <div>
    <div class="method-def">
      <access-flags
        class="tag"
        :access_flags="method_info.access_flags"
        :where="2">
      </access-flags>
      <el-tooltip
        class="tag"
        :content="signatureDisplay.index">
        <el-button
          type="text">
          {{signatureDisplay.value}}
        </el-button>
      </el-tooltip>
      <el-tooltip
        class="tag"
        :content="nameDisplay.index">
        <el-button
          type="text">
          {{nameDisplay.full}}
        </el-button>
      </el-tooltip>
      <el-tooltip
        class="tag"
        :content="signatureDisplay.index">
        <el-button
          type="text">
          {{signatureDisplay.args}}
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import AccessFlags from './AccessFlags.vue'
import { TRANSLATE_TYPE } from '@/js/constants.js'

export default {
  name: 'MethodDef',
  components: {
    AccessFlags,
  },
  props: {
    method_info: Object,
    cpdisplay: Array,
  },
  computed: {
    signatureDisplay() {
      let type = TRANSLATE_TYPE(this.cpdisplay[this.method_info.signature_index - 1].content)
      return {
        index: '#' + this.method_info.signature_index,
        value: type.value,
        args: type.args,
      }
    },
    nameDisplay() {
      return {
        index: '#' + this.method_info.name_index,
        full: this.cpdisplay[this.method_info.name_index - 1].content,
      }
    },
  },
}
</script>

<style scoped>
.method-def {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.tag + .tag {
  margin-left: 15px;
}
</style>