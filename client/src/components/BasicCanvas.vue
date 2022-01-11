<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-shadow */
import {
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
} from 'vue';

import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',
  setup(props) {
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    const canvasWidth = 640;

    const canvasRatio = (16 / 6); // Aspect ratio of the canvas. Currently 16:6

    /**
     * Initialize the Fabric.js canvas
     */
    const initFabricCanvas = () => {
      // Get width for new canvas from wrapper div and set it when creating new canvas
      // Note: this is not responsive and will not resize canvas element when page is resized
      const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));

      canvasData = new fabric.Canvas('main-canvas', {
        width: canvasDiv.clientWidth,
        height: canvasDiv.clientWidth / canvasRatio,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
      });
      // Set Drawing mode
      canvasData.isDrawingMode = false;
    };

    onMounted(initFabricCanvas);

    return {
      canvasData,
      initFabricCanvas,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
