<template>
  <div class="modal" :id="modalID" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Equation Editor</h5>
          <button type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close">
          </button>
        </div>
        <div class="modal-body">
          <textarea id="tex-equation" v-model.trim="texEquation" @input="renderEquationToHTML"/>
          <div id="katex-output" ></div>
        </div>
        <div class="modal-footer">
          <button type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal">
            Close
          </button>
          <button type="button"
                  class="btn btn-primary"
                  id="render-equation-canvas"
                  @click="printCanvasFromKatex">
            Print Canvas
          </button>
        </div>
      </div>
    </div>
  </div>
  <div id="html-to-canvas-div"></div>
</template>

<script lang="ts">
import {
  defineComponent, Ref, ref,
} from 'vue';
import katex from 'katex';
import html2canvas from 'html2canvas';

export default defineComponent({
  props: {
    equation: {
      type: String,
      required: false,
      default: '',
    },
    modalID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const texEquation: Ref<string> = ref(props.equation);

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
