<template>
  <div class="class-def">
    <access-flags
      class="tag"
      :access_flags="class_info.access_flags"
      :where="0">
    </access-flags>
    <span class="tag">class</span>
    <el-tooltip
      class="tag"
      :content="classDisplay.index">
      <el-button
        type="text">
        {{classDisplay.full}}
      </el-button>
    </el-tooltip>
    <span class="tag">extends</span>
    <el-tooltip
      class="tag"
      :content="extendsDisplay.index">
      <el-button
        type="text">
        {{extendsDisplay.full}}
      </el-button>
    </el-tooltip>
    <span v-if="interfacesDisplay.length" class="tag">implements</span>
    <el-tooltip
      v-for="(v,k) in interfacesDisplay"
      :key="k"
      class="tag"
      :content="v.index">
      <el-button
        type="text">
        {{v.full}}
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import AccessFlags from './AccessFlags.vue'

export default {
  name: 'ClassDef',
  components: {
    AccessFlags,
  },
  props: {
    class_info: Object,
    cpdisplay: Array,
  },
  computed: {
    classDisplay() {
      let display = this.cpdisplay[this.class_info.this_class_index - 1]
      let rt = {}
      if (display) {
        rt.index = '#' + this.class_info.this_class_index + ' -> ' + display.content
        rt.full = display.fullcontent
      }
      return rt
    },
    extendsDisplay() {
      let display = this.cpdisplay[this.class_info.super_class_index - 1]
      let rt = {}
      if (display) {
        rt.index = '#' + this.class_info.super_class_index + ' -> ' + display.content
        rt.full = display.fullcontent
      }
      return rt
    },
    interfacesDisplay() {
      let rt = new Array(this.class_info.interfaces_.length)
      for (let i = 0; i < rt.length; i++) {
        let display = this.cpdisplay[this.class_info.interfaces_[i] - 1]
        rt[i] = {}
        if (display) {
          rt[i].index = '#' + this.class_info.interfaces_[i] + ' -> ' + display.content
          rt[i].full = display.fullcontent
        }
      }
      return rt
    },
  },
}
</script>

<style scoped>
.class-def {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.tag + .tag {
  margin-left: 15px;
}
</style>