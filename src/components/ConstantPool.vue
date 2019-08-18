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
export default {
  name: 'ConstantPool',
  props: {
    cpdisplay: Array,
  },
}
</script>