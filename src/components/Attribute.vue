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
          <div v-if="typeof(code)=='string'" class="code-error">{{code}}</div>
          <div v-else>
            <div v-for="(v,k) in code" :key="k">
              <span class="code-addr">{{v.addr}}</span>
              <span>{{v.str}}</span>
              <el-tooltip v-if="v.pInd" :content="v.pInd">
                <el-button class="code-param" type="text">{{v.pFull}}</el-button>
              </el-tooltip>
            </div>
          </div>
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
import { TRANSLATE_TYPE, BYTECODE, BC_PARAM } from '@/js/constants.js'

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
          full: obj.fullcontent || obj.content,
        }
      } else
        return null
    },
    code() {
      if (this.nameDisplay.full == 'Code') {
        let code = this.attribute.code_
        let addr = 0
        let rt = []
        let wide = false
        while (addr < code.length) {
          let byte = code[addr]
          let name = BYTECODE[byte]
          if (!name) {
            console.log(rt) // debug
            return 'ERROR: unknown byte ' + byte
          }
          let rti = {
            addr,
            str: name
          }
          if (name == 'wide') {
            wide = true
          } else if (name == 'tableswitch') {
            //
          } else if (name == 'lookupswitch') {
            //
          } else {
            let param = BC_PARAM[name]
            if (param) {
              for (let item of param) {
                let itemLen = item.len || item
                if (addr + itemLen >= code.length) {
                  console.log(rt) // debug
                  console.log(wide) // debug
                  return 'ERROR: operands not enough'
                }
                let itemValue = 0
                for (let i = 0; i < itemLen; i++) {
                  itemValue = itemValue * 0x100 + code[++addr]
                }
                if (item.type) {
                  switch (item.type) {
                    case 'cp':
                      rti.str += ' #' + itemValue
                      let obj = this.cpdisplay[itemValue - 1]
                      if (obj) {
                        rti.pInd = '#' + itemValue + ' (' + obj.tag + ')'
                        rti.pFull = obj.fullcontent || obj.content
                      }
                      break
                    case 'wide':
                      if (wide) {
                        wide = false
                        itemValue = itemValue * 0x100 + code[++addr]
                      }
                      rti.str += ' ' + itemValue
                      break
                    case 'jmp':
                      rti.str += ' ' + itemValue + '(to ' + (rti.addr + itemValue) + ')'
                      break
                    case 'pass':
                      rti.str += ' (' + itemValue + ')'
                      break
                  }
                } else {
                  rti.str += ' ' + itemValue
                }
              }
            }
          }
          rt.push(rti)
          addr++
        }
        if (wide) {
          console.log(rt) // debug
          console.log(op) // debug
          return 'ERROR: wide left'
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

.code-error {
  font-weight: bold;
  color: red;
}

.code-addr {
  display: inline-block;
  width: 60px;
}

.code-param {
  margin-left: 10px;
  padding: 0;
}
</style>