<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas" height="480" width="100%"></canvas>
  </div>
  <div>
    <span><button>Pen tool toggle</button></span><span>{{ penStatus }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, reactive, Ref, ref,
} from 'vue';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',

  setup(props) {
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));

    const penStatus: Ref<boolean> = ref(false);

    /**
     * Initialize the Fabric.js canvas
     */
    const initFabricCanvas = async () => {
      canvasData = new fabric.Canvas('main-canvas');
    };

    /**
     * Set the width of the canvas element to be the width of its wrapping div element
     */
    const setCanvasWidth = async () => {
      const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));
      const canvasElem: HTMLCanvasElement = (<HTMLCanvasElement> document.getElementById('main-canvas'));

      canvasElem.width = canvasDiv.clientWidth;
      canvasElem.height = canvasDiv.clientHeight;
    };

    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);
    onMounted(setCanvasWidth);

    return {
      penStatus,
      canvasData,
      initFabricCanvas,
      setCanvasWidth,
    };
  },
});
</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
