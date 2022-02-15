<template>
  <h1> This is the equation viewer </h1>
  <textarea id="tex-equation" v-model.trim="texEquation" @input="renderEquationToHTML"/>
  <div>
    <button id="process-equation" @click="processEquation">Process</button>
    <button id="render-equation-canvas" @click="printCanvasFromKatex">Print Canvas</button>
  </div>
  <div id="katex-output" ></div>
  <div id="html-to-canvas-div"></div>
</template>

<script lang="ts">
import {
  defineComponent, Ref, ref,
} from 'vue';
import katex from 'katex';
import html2canvas from 'html2canvas';

export default defineComponent({
  setup() {
    const texEquation: Ref<string> = ref('E = mc^2');

    const renderEquationToHTML = () => {
      const katexDiv = document.getElementById('katex-output');

      if (katexDiv) {
        katex.render(texEquation.value, katexDiv, {
          throwOnError: false,
        });
      }
    };

    const printCanvasFromKatex = () => {
      const katexDiv = document.getElementById('katex-output');

      if (katexDiv) {
        html2canvas(katexDiv).then((canvas) => {
          const canvasDiv = document.getElementById('html-to-canvas-div');
          if (canvasDiv) {
            canvasDiv.appendChild(canvas);
          }
        });
      }
    };

    return {
      texEquation,
      renderEquationToHTML,
      printCanvasFromKatex,
    };
  },
});
</script>
