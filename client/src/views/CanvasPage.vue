<template>
  <div class="canvas-background-box">
    test test
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NLayout, NCard } from 'naive-ui';

export default defineComponent({
  components: {
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.canvas-background {
  display: flex;
  flex-flow: column;
  background-color: gray;
  height: 100%;
}
</style>
