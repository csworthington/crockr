<template>
  <n-space horizontal>
    <ToolButton
      buttonText="button text here"
    >
      <template #icon>
        <Cursor20Filled />
      </template>
    </ToolButton>
    <ColourButton></ColourButton>

    <NRadioGroup v-model:value="value" name="radiobuttongroup">
      <NRadioButton
        v-for="tool in tools"
        :key="tool.value"
        :value="tool.value"
      >
        <Icon>
          <component :is="tool.icon" />
        </Icon>
        {{ tool.label }}
      </NRadioButton>
    </NRadioGroup>
  </n-space>
</template>

<script lang="ts">
/* eslint-disable import/no-extraneous-dependencies */

import { defineComponent, ref } from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NRadioGroup, NRadioButton, NSpace } from 'naive-ui';

import { Icon } from '@vicons/utils';
import { Cursor20Filled } from '@vicons/fluent';

import ColourButton from '@/components/ToolPalette/ColourButton.vue';
import ToolButton from '@/components/ToolPalette/ToolButton.vue';

export default defineComponent({
  components: {
    NSpace,
    NRadioGroup,
    NRadioButton,
    Icon,
    Cursor20Filled,
    ToolButton,
    ColourButton,
  },
  setup() {
    return {
      cursorIcon: Cursor20Filled,
      value: ref(null),
      disabled2: ref(false),
      disabled1: ref(false),
      tools: [
        {
          value: 'select-tool',
          label: 'Select',
        },
        {
          value: 'pen-tool',
          label: 'Pen',
        },
        {
          value: 'rectangle-tool',
          label: 'Rect',
        },
        {
          value: 'circle-tool',
          label: 'Circle',
        },
        {
          value: 'line-tool',
          label: 'Line',
        },
        {
          value: 'clear-canvas',
          label: 'Clear Canvas',
        },
      ].map((s) => {
        // eslint-disable-next-line no-param-reassign
        s.value = s.value.toLowerCase();
        return s;
      }),
    };
  },
});
</script>
