<template>
  <n-space vertical>
    <NRadioGroup v-model:value="value" name="radiobuttongroup">
      <NRadioButton
        v-for="song in songs"
        :key="song.value"
        :value="song.value"
        :disabled="(song.label === 'Live Forever' && disabled1
          || song.label === 'Shakermaker' && disabled2)"
      >
        {{ song.label }}
      </NRadioButton>
    </NRadioGroup>
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NRadioGroup, NRadioButton, NSpace } from 'naive-ui';

export default defineComponent({
  components: {
    NSpace,
    NRadioGroup,
    NRadioButton,
  },
  setup() {
    return {
      value: ref(null),
      disabled2: ref(false),
      disabled1: ref(false),
      songs: [
        {
          value: "Rock'n'Roll Star",
          label: "Rock'n'Roll Star",
        },
        {
          value: 'Shakermaker',
          label: 'Shakermaker',
        },
        {
          value: 'Live Forever',
          label: 'Live Forever',
        },
        {
          value: 'Up in the Sky',
          label: 'Up in the Sky',
        },
        {
          value: '...',
          label: '...',
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
