<template>
  <h1> This is the equation viewer </h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const { mathjax } = require('mathjax-full/js/mathjax.js');

export default defineComponent({
  setup() {
    console.log(MathJax);

    return {};
  },
});
</script>
