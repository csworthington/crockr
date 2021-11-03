<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onBeforeMount, onMounted, reactive, Ref, ref,
} from 'vue';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',

  setup(props) {
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));

    const penStatus: Ref<boolean> = ref(false);

    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      console.log(`pen tool is now ${penStatus.value}`);
    };

    /**
     * Initialize the Fabric.js canvas
     */
    const initFabricCanvas = async () => {
      // Get width for new canvas from wrapper div and set it when creating new canvas
      // Note: this is not responsive and will not resize canvas element when page is resized
      const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));

      canvasData = new fabric.Canvas('main-canvas', {
        width: canvasDiv.clientWidth,
        height: canvasDiv.clientHeight,
      });

      // Set Drawing mode
      canvasData.isDrawingMode = false;
    };

    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);

    return {
      penStatus,
      canvasData,
      togglePenTool,
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
