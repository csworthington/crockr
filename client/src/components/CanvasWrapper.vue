<template>
  <p>Canvas Wrapper</p>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="canvas-id" height="480" width="100%"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',
  props: {
    msg: String,
  },
  data() {
    return {
      canvasData: {} as fabric.Canvas,
    };
  },
  mounted() {
    // Set Canvas Width
    const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));
    const canvasElem: HTMLCanvasElement = (<HTMLCanvasElement> document.getElementById('canvas-id'));

    canvasElem.width = canvasDiv.clientWidth;
    canvasElem.height = canvasDiv.clientHeight;

    // Init fabric for canvas
    this.canvasData = new fabric.Canvas('canvas-id');

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 20,
      height: 20,
    });

    this.canvasData.add(rect);
  },
});
</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
