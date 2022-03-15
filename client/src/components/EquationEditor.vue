<template>
  <div class="modal" :id="modalID" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Equation Editor</h5>
          <button type="button"
                  id="equation-editor-close"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close">
          </button>
        </div>
        <div class="modal-body">
          <textarea id="tex-equation" v-model.trim="texEquation" @input="renderEquationToHTML"/>
          <div id="katex-output" ></div>
          <p>ID = {{ equationID }}, tex = {{ texEquation }} </p>
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
  <div class="hidden-div">
    <span id="hidden-katex-output" class="canvas-katex"></span>
  </div>
  <!-- <div id="html-to-canvas-div"></div> -->
</template>

<script lang="ts">
import {
  defineComponent, Ref, ref, watch, watchEffect,
} from 'vue';
import { Modal } from 'bootstrap';
import katex from 'katex';
import html2canvas from 'html2canvas';

export interface EquationEditorUpdate {
  id: string,
  texEquation: string,
  dataURL: string,
}

export default defineComponent({
  props: {
    equation: {
      type: String,
      required: false,
      default: '',
    },
    equationID: {
      type: String,
      required: false,
      default: '',
    },
    modalID: {
      type: String,
      required: true,
    },
  },
  emits: ['update:equation'],
  setup(props, { emit }) {
    const texEquation: Ref<string> = ref(props.equation);

    const emitEquation = (canvasDataURL: string) => {
      emit('update:equation', {
        id: props.equationID,
        texEquation: texEquation.value,
        dataURL: canvasDataURL,
      });
    };

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
      const visibleKatexDiv = document.getElementById('katex-output');

      if (visibleKatexDiv) {
        // Render katex in hidden div
        const hiddenKatexSpan = document.getElementById('hidden-katex-output');

        if (hiddenKatexSpan) {
          katex.render(texEquation.value, hiddenKatexSpan, {
            throwOnError: false,
            output: 'html',
          });

          html2canvas(hiddenKatexSpan, {
            // width: hiddenKatexSpan.clientWidth,
            // height: hiddenKatexSpan.clientHeight,
            removeContainer: true,
          }).then((canvas) => {
            // Hide canvas
            const canvasDataURL = canvas.toDataURL('image/png');
            emitEquation(canvasDataURL);

            // Delete Katex HTML
            hiddenKatexSpan.innerHTML = '';
            visibleKatexDiv.innerHTML = '';

            // Clear modal content
            texEquation.value = '';

            // Close the Modal
            const modalDiv = document.getElementById(props.modalID);
            if (modalDiv) {
              Modal.getOrCreateInstance(modalDiv).hide();
            }
          });
        }
      }
    };

    watch(() => props.equation, (first: string, second: string) => {
      console.log(`equation was ${first}, is now ${second}`);
    });

    return {
      texEquation,
      renderEquationToHTML,
      printCanvasFromKatex,
    };
  },
});
</script>

<style>
.hidden-div {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.katex {
  font-size: 4rem;
}
.canvas-katex {
  font-size: 10rem;
}
</style>
