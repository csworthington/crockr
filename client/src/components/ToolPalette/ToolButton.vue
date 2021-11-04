<template>
  <NButton v-bind="buttonProps">
    <template v-if="hasIcon" #icon>
      <NIcon iconProps>
        <slot name="icon" />
      </NIcon>
    </template>
    {{ buttonText }}
  </NButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { NButton, NIcon } from 'naive-ui';

export default defineComponent({
  props: {
    buttonText: {
      type: String,
      required: false,
    },
    iconProps: {
      type: Object,
      required: false,
    },
    buttonProps: {
      type: Object,
      required: false,
    },
  },
  components: {
    NButton,
    NIcon,
  },
  setup(props, context) {
    /**
     * Checks if icon slot has been populated. Returns true if icon slot exists, false otherwise
     */
    const hasIcon = () => context.slots.icon;

    return {
      hasIcon,
    };
  },
});
</script>
