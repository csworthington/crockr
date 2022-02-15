<template>
  <textarea id="tex-equation" v-model.trim="texEquation" @input="renderEquationToHTML"/>
  <div>
    <button id="process-equation" @click="renderEquationToHTML">Process</button>
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
    const texEquation: Ref<string> = ref('');

    const renderEquationToHTML = () => {
      const katexDiv = document.getElementById('katex-output');

      if (katexDiv) {
        katex.render(texEquation.value, katexDiv, {
          throwOnError: false,
          output: 'html',
        });
      }
    };

    const printCanvasFromKatex = () => {
      const katexDiv = document.getElementById('katex-output');

      if (katexDiv) {
        html2canvas(katexDiv).then((canvas) => {
          console.log(canvas.toDataURL());
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

<style>
.katex {
  font-size: 4rem;
}
</style>
