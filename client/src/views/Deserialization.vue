<template>
hello all
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span><button @click="getDogFromServer">Get Dog🐶</button></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from 'vue';
import { fabric } from 'fabric';
import { useAxios } from '@/utils/useAxios';
import { ShapesWithID } from '@/utils/fabric-object-extender';
import getUUID from '@/utils/id-generator';

export default defineComponent({
  setup() {
    const axios = useAxios();
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));

    const initFabricCanvas = () => {
      // Get width for new canvas from wrapper div and set it when creating new canvas
      // Note: this is not responsive and will not resize canvas element when page is resized
      const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));

      canvasData = new fabric.Canvas('main-canvas', {
        width: canvasDiv.clientWidth,
        height: canvasDiv.clientWidth * 0.6,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
      });
    };

    onMounted(initFabricCanvas);

    const getDogFromServer = () => {
      axios.get('./api/canvas/getdog').then((value) => {
        console.log('got dog');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        canvasData.loadFromJSON(value.data, canvasData.renderAll.bind(canvasData));
        console.log(canvasData.toJSON());
      });
    };

    return {
      getDogFromServer,
    };
  },
});
</script>
