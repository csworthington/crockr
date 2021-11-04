<template>
  <NButton @click="openColourMenu" v-bind="buttonProps">
    <template #icon>
      <NIcon iconProps>
        <PaintBucket20Filled />
      </NIcon>
    </template>
    Colour
  </NButton>
  <span>
    <input aria-hidden="true" id="colour-picker" type="color" value="#ffffff" @input="setColour"/>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { NButton, NIcon } from 'naive-ui';

import { Icon } from '@vicons/utils';
import { PaintBucket20Filled } from '@vicons/fluent';

export default defineComponent({
  props: {},
  components: {
    NButton,
    NIcon,
    PaintBucket20Filled,
  },
  setup(props, context) {
    const openColourMenu = () => {
      const colourPicker: HTMLInputElement = document.getElementById('colour-picker') as HTMLInputElement;
      colourPicker.click();
    };

    const setColour = (value: any) => {
      console.log(value);
    };

    return {
      openColourMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
.invisible {
  padding: 0px;
  margin: 0px;
  visibility: hidden;
  transform: scale(0);
}
</style>
