<template>
  <div class="equation-viewer">
    <button type="button"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#equation-modal">
      Launch Equation Editor
    </button>
    <EquationEditor :modalID="'equation-modal'"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EquationEditor from '@/components/EquationEditor.vue';

export default defineComponent({
  name: 'Equations',
  components: {
    EquationEditor,
  },
});
</script>
