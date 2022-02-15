<template>
  <div class="equation-viewer">
    <EquationViewer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EquationViewer from '@/components/EquationEditor.vue';

export default defineComponent({
  name: 'Equations',
  components: {
    EquationViewer,
  },
});
</script>
