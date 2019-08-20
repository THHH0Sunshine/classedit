<template>
  <div>
    <el-upload
      action=""
      accept=".class"
      :http-request="upload">
      <el-button size="small" type="primary">Upload Class File...</el-button>
    </el-upload>
    <class-def
      v-if="parsedClassFile"
      :class_info="parsedClassFile"
      :cpdisplay="cpdisplay">
    </class-def>
    <div>
      <field-def
        v-for="(v,k) in fields"
        :key="k"
        :field_info="v"
        :cpdisplay="cpdisplay">
      </field-def>
    </div>
    <div>
      <method-ref
        v-for="(v,k) in methods"
        :key="k"
        :method_info="v"
        :cpdisplay="cpdisplay">
      </method-ref>
    </div>
    <constant-pool
      v-if="parsedClassFile"
      :cpdisplay="cpdisplay">
    </constant-pool>
  </div>
</template>

<script>
import ClassDef from './ClassDef.vue'
import FieldDef from './FieldDef.vue'
import MethodRef from './MethodDef.vue'
import ConstantPool from './ConstantPool.vue'
import { parseClassFileArrayBuffer } from '@/js/cfparser.js'
import { CP_TAG_NAME, TRANSLATE_TYPE } from '@/js/constants.js'

export default {
  name: 'Editor',
  components: {
    ClassDef,
    FieldDef,
    MethodRef,
    ConstantPool,
  },
  data() {
    return {
      parsedClassFile: null,
    }
  },
  computed: {
    constant_pool() {
      return this.parsedClassFile ? this.parsedClassFile.constant_pool : null
    },
    cpdisplay() {
      if (!this.parsedClassFile)
        return []
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
                rt[i].type = TRANSLATE_TYPE(this.constant_pool[obj.type_index].utf8_)
                rt[i].fullcontent = rt[i].name + ':' + this.constant_pool[obj.type_index].utf8_
                break
            }
          } else
            rt[i] = {}
        }
        for (let i = 0; i < rt.length; i++) {
          let obj = this.constant_pool[i + 1]
          if (!obj)
            continue
          if (obj.tag_ >= 9 && obj.tag_ <= 11) {
            let c = rt[obj.class_index - 1]
            let nat = rt[obj.name_and_type_index - 1]
            rt[i].fullcontent = nat.type.value + ' ' + c.fullcontent + '::' + nat.name + nat.type.args
          } else if (obj.tag_ == 16) {
            let t = TRANSLATE_TYPE(this.constant_pool[obj.descriptor_index].utf8_)
            rt[i].fullcontent = t.value + ' (*)' + t.args
          } else if (obj.tag_ == 18) {
            let nat = rt[obj.name_and_type_index - 1]
            rt[i].fullcontent = nat.type.value + ' [' + obj.bootstrap_method_attr_index + ']:' + nat.name + nat.type.args
          }
        }
        for (let i = 0; i < rt.length; i++) {
          let obj = this.constant_pool[i + 1]
          if (!obj)
            continue
          if (obj.tag_ == 15) {
            rt[i].fullcontent = obj.reference_kind + ': ' + this.constant_pool[obj.reference_index].fullcontent
          }
        }
        return rt
      } catch (e) {
        console.log(e) //debug
        return []
      }
    },
    fields() {
      return this.parsedClassFile ? this.parsedClassFile.fields_ : []
    },
    methods() {
      return this.parsedClassFile ? this.parsedClassFile.methods_ : []
    },
  },
  methods: {
    upload(o) {
      let reader = new FileReader()
      reader.onload = (e => (this.parsedClassFile = parseClassFileArrayBuffer(e.target.result)))
      reader.readAsArrayBuffer(o.file)
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
        case 15:
          return obj.reference_kind + ':#' + obj.reference_index
        case 16:
          return '#' + obj.descriptor_index
        case 18:
          return '[' + obj.bootstrap_method_attr_index + ']:#' + obj.name_and_type_index
        default:
          return null
      }
    },
  },
}
</script>