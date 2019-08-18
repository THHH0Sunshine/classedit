<template>
  <div>
    <el-table
      :data="cpdisplay">
      <el-table-column
        type="index">
      </el-table-column>
      <el-table-column
        prop="tag"
        label="Tag">
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
import { CP_TAG_NAME } from '@/js/constants.js'

export default {
  name: 'ConstantPool',
  props: {
    constant_pool: Array,
  },
  computed: {
    cpdisplay() {
      let rt = new Array(this.constant_pool.length - 1)
      for (let i = 0; i < rt.length; i++) {
        rt[i] = this.getCPItemDisplay(this.constant_pool[i + 1])
        rt[i].tag = CP_TAG_NAME[this.constant_pool[i + 1].tag_]
      }
      return rt
    },
  },
  methods: {
    getCPItemDisplay(obj) {
      let rt = {}
      switch (obj.tag_) {
        case 1:
          rt.content = obj.utf8_
          break
        case 3:
          rt.content = obj.integer_
          break
        case 4:
          rt.content = obj.float_
          break
        case 5:
          rt.content = 'hiword:' + obj.long_.h + ',loword:' + obj.long_.l
          break
        case 6:
          rt.content = obj.double_
          break
        case 7:
          rt.content = '#' + obj.name_index
          rt.fullcontent = this.constant_pool[obj.name_index].utf8_
          break
        case 8:
          rt.content = '#' + obj.string_index
          rt.fullcontent = this.constant_pool[obj.string_index].utf8_
          break
        case 9:
        case 10:
        case 11:
          rt.content = '#' + obj.class_index + '.#' + obj.name_and_type_index
          let c = this.constant_pool[obj.class_index]
          let nat = this.constant_pool[obj.name_and_type_index]
          rt.fullcontent = this.constant_pool[c.name_index].utf8_ + '.' + this.constant_pool[nat.name_index].utf8_ + ':' + this.constant_pool[nat.type_index].utf8_
          break
        case 12:
          rt.content = '#' + obj.name_index + ':#' + obj.type_index
          rt.fullcontent = this.constant_pool[obj.name_index].utf8_ + ':' + this.constant_pool[obj.type_index].utf8_
          break
      }
      return rt
    },
  },
}
</script>