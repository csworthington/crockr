<template>
  <div class="d-inline-flex flex-row">
    <div class="p-1">
      <input
        type="color"
        class="form-control form-control-color"
        name="primary-colour-selection"
        id="secondary-colour-selection"
        v-model="primaryToolColour"
      />
    </div>
    <div class="p-1">
      <button type="button"
              class="btn btn-outline-secondary"
              id="swap-colours"
              @click="swapToolColours">
        &#8646;
      </button>
    </div>
    <div class="p-1">
      <input type="color"
             class="form-control form-control-color"
             name="secondary-colour-selection"
             id="secondary-colour-selection"
             v-model="secondaryToolColour" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, WritableComputedRef } from 'vue';
import { useStore } from 'vuex';
import { StoreKey } from '@/symbols';

export default defineComponent({
  setup() {
    const store = useStore(StoreKey);

    // Selected tool colour. Stored in Vuex Store
    const primaryToolColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.colourPalette.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('colourPalette/updatePrimaryToolColour', newValue);
      },
    });

    const secondaryToolColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.colourPalette.secondaryToolColour;
      },
      set(newValue: string): void {
        store.commit('colourPalette/updateSecondaryToolColour', newValue);
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
