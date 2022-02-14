<template>
  <h1> This is the equation viewer </h1>
  <textarea id="tex-equation" v-model.trim="texEquation" />
  <button id="process-equation" @click="processEquation">Process</button>
  <div id="mathjax-output" ></div>
</template>

<script lang="ts">
import {
  defineComponent, reactive, Ref, ref,
} from 'vue';
import { initMathJax } from '@/services/mathjax/mathjax';

function mjCallback() {
  console.log('mathjax callback');
}

initMathJax(mjCallback);

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const MathJaxAPI = require('mathjax-full').init({
//   options: { enableAssistiveMml: true },
//   loader: {
//     source: {},
//     load: ['adaptors/liteDOM', 'tex-svg'],
//   },
//   packages: PACKAGES.split(/\s*,\s*/),
//   svg: {
//     fontCache: 'local',
//   },
//   startup: {
//     typeset: false,
//   },
// }).then((MathJax: any) => {
//   // const svg = MathJax.tex2svg();
//   const svg = MathJax.tex2svg('\\frac{1}{x^2-1}', { display: true });
//   console.log(MathJax.startup.adaptor.outerHTML(svg));
// });

export default defineComponent({
  setup() {
    const texEquation: Ref<string> = ref('E = mc^2');
    const svgOutput: any = reactive({});

    const processEquation = () => {
      (window as any).MathJax.texReset();
      const options = (window as any).MathJax.getMetricsFor(texEquation.value);
      options.display = true;

      // const svg = (window as any).MathJax.tex2svg(texEquation.value);

      (window as any).MathJax.tex2svgPromise(texEquation.value, options).then((node: any) => {
        const mathjaxDiv = document.getElementById('mathjax-output');
        if (mathjaxDiv) {
          mathjaxDiv.appendChild(node);
        }
        (window as any).MathJax.startup.document.clear();
        (window as any).MathJax.startup.document.updateDocument();
      });
      // console.log(typeof svg);
      // svgOutput.value = svg;
      // console.log(svgOutput.value);
      // svgOutput.value = '<p>Goodbye</p>';
    };

    return {
      texEquation,
      svgOutput,
      processEquation,
    };
  },
});
</script>
