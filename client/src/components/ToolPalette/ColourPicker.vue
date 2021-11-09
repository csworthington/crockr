<template>
  <span>
    <input
      type="color"
      name="primary-colour-selection"
      id="secondary-colour-selection"
      v-model="primaryToolColour"
    />
    <input
      type="color"
      name="secondary-colour-selection"
      id="secondary-colour-selection"
      v-model="secondaryToolColour"
    />
    <button id="swap-colours" @click="swapToolColours">&#8646;</button>
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, WritableComputedRef } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const store = useStore();

    // Selected tool colour. Stored in Vuex Store
    const primaryToolColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

    const secondaryToolColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.secondaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updateSecondaryToolColour', newValue);
      },
    });

    const swapToolColours = () => {
      const oldPrimaryColour = primaryToolColour.value;
      primaryToolColour.value = secondaryToolColour.value;
      secondaryToolColour.value = oldPrimaryColour;
    };

    return {
      primaryToolColour,
      secondaryToolColour,
      swapToolColours,
    };
  },
});
</script>
