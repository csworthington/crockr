<template>
  <h1> This is the equation viewer </h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as MathJax from 'mathjax';

export default defineComponent({
  setup() {
    console.log(MathJax);

    return {};
  },
});
</script>
