<template>
  <div>
    <el-table
      :data="cpdisplay">
      <el-table-column
        type="index">
      </el-table-column>
      <el-table-column
        prop="tag"
        label="Tag"
        width="150">
      </el-table-column>
      <el-table-column
        prop="content"
        label="Content">
      </el-table-column>
      <el-table-column
        prop="fullcontent"
        label="Computed Value">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { CP_TAG_NAME, BASIC_TYPE_IDENTIFIER } from '@/js/constants.js'

export default {
  name: 'ConstantPool',
  props: {
    constant_pool: Array,
  },
  computed: {
    cpdisplay() {
      try {
        let rt = new Array(this.constant_pool.length - 1)
        for (let i = 0; i < rt.length; i++) {
          let obj = this.constant_pool[i + 1]
          if (obj) {
            rt[i] = {
              tag: CP_TAG_NAME[this.constant_pool[i + 1].tag_],
              content: this.getCPItemContent(obj),
            }
            switch (obj.tag_) {
              case 7:
                rt[i].fullcontent = this.constant_pool[obj.name_index].utf8_.replace(/\//g, '.')
                break
              case 8:
                rt[i].fullcontent = this.constant_pool[obj.string_index].utf8_
                break
              case 12:
                rt[i].name = this.constant_pool[obj.name_index].utf8_
                rt[i].type = this.translateType(this.constant_pool[obj.type_index].utf8_)
                rt[i].fullcontent = rt[i].name + ':' + this.constant_pool[obj.type_index].utf8_
                break
            }
          } else
            rt[i] = {}
        }
        for (let i = 0; i < rt.length; i++) {
          let obj = this.constant_pool[i + 1]
          if (obj && obj.tag_ >= 9 && obj.tag_ <= 11) {
            let c = rt[obj.class_index - 1]
            let nat = rt[obj.name_and_type_index - 1]
            rt[i].fullcontent = nat.type.value + ' ' + c.fullcontent + '::' + nat.name + nat.type.args
          }
        }
        return rt
      } catch (e) {
        console.log(e) //debug
        return []
      }
    },
  },
  methods: {
    translateType(str) {
      let rt = {
        value: '',
        args: '',
        len: 0,
      }
      let ch = str.charAt(0)
      let s = BASIC_TYPE_IDENTIFIER[ch]
      if (s) {
        rt.value = s
        rt.len = 1
      } else {
        switch (ch) {
          case 'L':
            let scind = str.indexOf(';')
            rt.value = str.substring(1, scind).replace(/\//g, '.')
            rt.len = scind + 1
            break
          case '[':
            let itm = this.translateType(str.substring(1))
            rt.value = itm.value + '[]'
            rt.len = itm.len + 1
            break
          case '(':
            let startind = 1
            let endind = str.indexOf(')')
            let sa = []
            while (startind < endind) {
              let arg = this.translateType(str.substring(startind))
              sa.push(arg.value)
              startind += arg.len
            }
            rt.args = '(' + sa.join(',') + ')'
            rt.value = this.translateType(str.substring(endind + 1)).value
            break
        }
      }
      return rt
    },
    getCPItemContent(obj) {
      switch (obj.tag_) {
        case 1:
          return obj.utf8_
        case 3:
          return obj.integer_
        case 4:
          return obj.float_ + 'F'
        case 5:
          let f = '', h = obj.long_.h, l = obj.long_.l
          if (h & 0x10000000) {
            h = ~h
            l = ~l + 1
            f = '-'
          }
          return f + '0x' + h.toString(16) + l.toString(16) + 'L'
        case 6:
          return obj.double_ + 'D'
        case 7:
          return '#' + obj.name_index
        case 8:
          return '#' + obj.string_index
        case 9:
        case 10:
        case 11:
          return '#' + obj.class_index + '.#' + obj.name_and_type_index
        case 12:
          return '#' + obj.name_index + ':#' + obj.type_index
        default:
          return null
      }
    },
  },
}
</script>