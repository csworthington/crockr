<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span>
      <input
        type="color"
        name="colour-selection"
        id="colour-selection"
        v-model="primaryColour"
      />
    </span>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
    <span><button @click="rectangle"> Rectangle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="erase"> Erase </button></span>
  </div>
  <span>
    state colour = {{ primaryColour }}
  </span>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, onMounted, reactive, Ref, ref, watch, WritableComputedRef,
} from 'vue';
import { useStore } from 'vuex';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',
  // data() {
  //   return {
  //     selectedColour: '#ffffff',
  //   };
  // },
  setup(props) {
    const store = useStore();

    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    let rect: fabric.Object;
    let circ: fabric.Object;
    let isDown: boolean;
    let origX: number;
    let origY: number;
    let tool: string;
    let radius: any;
    let strokeWidth: any;

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

    function onMouseDown(o: { e: Event; }) {
      isDown = true;
      const pointer = canvasData.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      if (tool === 'rectangle') {
        rect = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          angle: 0,
          fill: store.state.primaryToolColour,
          transparentCorners: false,
        });
        canvasData.add(rect);
      }
      if (tool === 'circle') {
        circ = new fabric.Circle({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          radius: pointer.x - origX,
          angle: 0,
          fill: 'blue',
          stroke: 'red',
          strokeWidth: 3,
        });
        canvasData.add(circ);
      }
    }

    function onMouseMove(o: { e: Event; }) {
      if (!isDown) return;
      const pointer = canvasData.getPointer(o.e);
      radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;

      if (tool === 'rectangle') {
        if (origX > pointer.x) {
          rect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          rect.set({ top: Math.abs(pointer.y) });
        }

        rect.set({ width: Math.abs(origX - pointer.x) });
        rect.set({ height: Math.abs(origY - pointer.y) });
      }
      /*
      if (tool === 'circle') {

      } */
      canvasData.renderAll();
    }

    function onMouseUp(o: { e: Event; }) {
      isDown = false;
    }

    // Watch for changes to primaryColour, and change brush colour when primaryColour changes
    watch(primaryColour, (currentValue: string) => {
      canvasData.freeDrawingBrush.color = currentValue;
    });

    const penStatus: Ref<boolean> = ref(false);

    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      canvasData.freeDrawingBrush.color = primaryColour.value;
      console.log(`pen tool is now ${penStatus.value}`);
    };

    const rectangle = async () => {
      tool = 'rectangle';
      canvasData.on('mouse:down', onMouseDown);
      canvasData.on('mouse:move', onMouseMove);
      canvasData.on('mouse:up', onMouseUp);
    };
    const circle = async () => {
      tool = 'circle';
      canvasData.on('mouse:down', onMouseDown);
      canvasData.on('mouse:move', onMouseMove);
      canvasData.on('mouse:up', onMouseUp);
    };

    const select = async () => {
      tool = 'select';
      canvasData.off('mouse:down', onMouseDown);
      canvasData.off('mouse:move', onMouseMove);
      canvasData.off('mouse:up', onMouseUp);
      canvasData.isDrawingMode = false;
    };
    const erase = async () => {
      canvasData.clear();
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
      primaryColour,
      penStatus,
      canvasData,
      togglePenTool,
      rectangle,
      circle,
      select,
      erase,
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
