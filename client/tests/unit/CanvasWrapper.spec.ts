import { shallowMount, VueWrapper } from '@vue/test-utils';
import axios from 'axios';
import VueAxios from 'vue-axios';
import BasicCanvas from '@/components/BasicCanvas.vue';

describe('CanvasWrapper.vue', () => {
  test('Deserializes a rectangle when passed', () => {
    const rectJson = '{"version":"4.6.0","objects":[{"type":"rectWithID","version":"4.6.0","originX":"left","originY":"top","left":33,"top":31.98,"width":105,"height":87.95,"fill":"#00ff00","stroke":"#00ff00","strokeWidth":2,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"id":"ef8c2abf-2354-4760-b9f9-57e1d4d52b63"}]}';
    const wrapper = shallowMount(BasicCanvas);
    console.log(wrapper);

    wrapper.vm.canvasData.loadFromJSON(
      JSON.stringify(rectJson),
      wrapper.vm.canvasData.renderAll.bind(wrapper.vm.canvasData),
    );
  });
});
