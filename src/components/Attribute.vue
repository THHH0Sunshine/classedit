<template>
  <div>
    <div>
      <el-tooltip
        :content="nameDisplay.index">
        <span>{{nameDisplay.full}}</span>
      </el-tooltip>
    </div>
    <div class="content">
      <div v-if="code">
        <div>stack={{attribute.max_stack}}, locals={{attribute.max_locals}}</div>
        <div class="code">byte code <b v-if="attribute.exception_table.length">and exception table </b>here...</div>
        <div>
          <attribute
            v-for="(v,k) in attribute.attributes_"
            :key="k"
            :attribute="v"
            :cpdisplay="cpdisplay">
          </attribute>
        </div>
      </div>
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
        let obj = this.cpdisplay[this.attribute[str] - 1]
        return {
          index: '#' + this.attribute[str],
          full: obj.fullcontent ? obj.fullcontent : obj.content,
        }
      } else
        return null
    },
    code() {
      if (this.nameDisplay.full == 'Code') {
        return {}
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

.code {
  padding-left: 15px;
}
</style>