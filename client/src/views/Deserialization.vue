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

    const addRectWithID = () => {
      fabric.RectWithID = fabric.util.createClass(fabric.Rect, {
        type: ShapesWithID.rect,
        initialize(options: any) {
          this.callSuper('initialize', options);
          // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
          // generate one at random.
          this.set('id', options.id || getUUID());
        },
        toObject() {
          return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
          });
        },
        toString() {
          return `${this.callSuper('toString')} (id: ${this.id})`;
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-types
      fabric.RectWithID.fromObject = function (object: any, callback: any) {
        // eslint-disable-next-line no-underscore-dangle
        return fabric.Object._fromObject('RectWithID', object, callback);
        // WHY DOES RECT WITH ID HAVE TO BE CAPS?
      };
    };

    onMounted(addRectWithID);
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
