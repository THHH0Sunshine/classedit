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
        <div class="code">
          <div v-for="(v,k) in code" :key="k">{{v}}</div>
          <b v-if="attribute.exception_table.length">exception table here...</b>
        </div>
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
      <el-tooltip
        v-if="signature"
        :content="signature.index">
        <el-button
          type="text">
          {{signature.full}}
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { TRANSLATE_TYPE, BYTECODE } from '@/js/constants.js'

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
        let rt = []
        let op = 0
        let wide = false
        for (let byte of this.attribute.code_) {
          if (op) {
            rt[rt.length - 1] += ' ' + byte
            op--
          } else {
            let name = BYTECODE[byte]
            if (!name) {
              console.log(rt) // debug
              return ['ERROR: unknown byte ' + byte]
            }
            if (name == 'wide') {
              wide = true
            } else if (name[0] > 0) {
              op = name[0] * 1
              if (wide) {
                wide = false
                op++
              }
              name = name.slice(2)
            }
            rt.push(name)
          }
        }
        if (op) {
          console.log(rt) // debug
          console.log(op) // debug
          console.log(wide) // debug
          return ['ERROR: operands left']
        }
        if (wide) {
          console.log(rt) // debug
          console.log(op) // debug
          return ['ERROR: wide left']
        }
        return rt
      } else
        return null
    },
    signature() {
      if (this.nameDisplay.full == 'Signature') {
        let trans = TRANSLATE_TYPE(this.cpdisplay[this.attribute.signature_index - 1].content)
        let rt = {
          index: '#' + this.attribute.signature_index,
          full: trans.value,
        }
        if (trans.args)
          rt.full += ' ' + trans.args
        if (trans.fgen)
          rt.full = trans.fgen + ' ' + rt.full
        return rt
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