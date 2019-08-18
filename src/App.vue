<template>
  <div id="app">
    <Editor/>
    <div class="about">classedit by Sunny💗</div>
  </div>
</template>

<script>
import Editor from './components/Editor.vue'

export default {
  name: 'app',
  components: {
    Editor,
  },
}
</script>

<style>
.about {
  text-align: center;
}
</style>
