<template>
  <div class="container">
    <main class="container-main">
      canvas will go here
    </main>
    <footer class="container-footer">
      <ToolPalette />
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NLayout, NCard } from 'naive-ui';
import ToolPalette from '@/components/ToolPalette/ToolPalette.vue';

export default defineComponent({
  components: {
    ToolPalette,
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  min-height: 90vh;

  .container-header, .container-footer {
    background-color: hotpink;
  }
  .container-main {
    flex: 1;
  }
}
</style>
