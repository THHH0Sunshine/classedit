<template>
  <div class="field-def">
    <access-flags
      class="tag"
      :access_flags="field_info.access_flags"
      :where="1">
    </access-flags>
    <el-tooltip
      class="tag"
      :content="signatureDisplay.index">
      <el-button
        type="text">
        {{signatureDisplay.full}}
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
  </div>
</template>

<script>
import AccessFlags from './AccessFlags.vue'
import { TRANSLATE_TYPE } from '@/js/constants.js'

export default {
  name: 'FieldDef',
  components: {
    AccessFlags,
  },
  props: {
    field_info: Object,
    cpdisplay: Array,
  },
  computed: {
    nameDisplay() {
      return {
        index: '#' + this.field_info.name_index,
        full: this.cpdisplay[this.field_info.name_index - 1].content
      }
    },
    signatureDisplay() {
      return {
        index: '#' + this.field_info.signature_index,
        full: TRANSLATE_TYPE(this.cpdisplay[this.field_info.signature_index - 1].content).value
      }
    },
  },
}
</script>

<style scoped>
.field-def {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.tag + .tag {
  margin-left: 15px;
}
</style>