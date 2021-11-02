<template>
  <CanvasWrapper></CanvasWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasWrapper from '@/components/CanvasWrapper.vue';

export default defineComponent({
  name: 'Canvas',
  components: {
    CanvasWrapper,
  },
});
</script>
