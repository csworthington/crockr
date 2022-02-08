<template>
  <h1> This is the equation viewer </h1>
  <textarea id="tex-equation" v-model.trim="texEquation" />
  <button id="process-equation">Process</button>
  <div id="output"></div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';

const PACKAGES = 'base, autoload, require, ams, newcommand';

require.context();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MathJaxAPI = require('mathjax-full').init({
  options: { enableAssistiveMml: true },
  loader: {
    source: {},
    load: ['adaptors/liteDOM', 'tex-svg'],
  },
  packages: PACKAGES.split(/\s*,\s*/),
  svg: {
    fontCache: 'local',
  },
  startup: {
    typeset: false,
  },
}).then((MathJax: any) => {
  // const svg = MathJax.tex2svg();
  const svg = MathJax.tex2svg('\\frac{1}{x^2-1}', { display: true });
  console.log(MathJax.startup.adaptor.outerHTML(svg));
});

export default defineComponent({
  setup() {
    const texEquation: Ref<string> = ref('E = mc^2');

    // if (window.MathJax) {
    //   const convertTex = () => {
    //     const input = texEquation.value;
    //   };
    // }

    return {
      texEquation,
    };
  },
});
</script>
