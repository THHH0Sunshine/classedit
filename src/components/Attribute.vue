<template>
  <div>
    <div>
      <el-tooltip
        :content="nameDisplay.index">
        <span>{{nameDisplay.full}}</span>
      </el-tooltip>
    </div>
    <div class="content">
      <el-tooltip
        v-if="constantvalue"
        :content="constantvalue.index">
        <el-button
          type="text">
          {{constantvalue.full}}
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Attribute',
  props: {
    attribute: Object,
    cpdisplay: Array,
  },
  computed: {
    nameDisplay() {
      return {
        index: '#' + this.attribute.attribute_name_index,
        full: this.cpdisplay[this.attribute.attribute_name_index - 1].content,
      }
    },
    constantvalue() {
      if (this.nameDisplay.full == 'ConstantValue' || this.nameDisplay.full == 'SourceFile') {
        let str = this.nameDisplay.full.toLowerCase() + '_index'
        return {
          index: '#' + this.attribute[str],
          full: this.cpdisplay[this.attribute[str] - 1].content,
        }
      } else
        return null
    },
  },
}
</script>

<style scoped>
.content {
  padding-left: 15px;
}
</style>