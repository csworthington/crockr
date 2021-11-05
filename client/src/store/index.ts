import { createStore } from 'vuex';

export default createStore({
  state: {
    primaryToolColour: '#0000ff',
  },
  mutations: {
    /**
     * Update the primary drawing tool colour. Only accepts RGB hex strings. Will throw
     * error if passed invalid string.
     * @param state Current state of the store
     * @param newColour The new RGB hex string to set the colour to
     */
    updatePrimaryToolColour(state, newColour: string) {
      // check that string is correct
      const rgbRegex = /^#(?:[0-9a-fA-F]{3}){2}$/gm;
      if (rgbRegex.test(newColour)) {
        state.primaryToolColour = newColour;
      } else {
        throw new Error(`Invalid RGB string "${newColour}". String must be a valid RGB hex string`);
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
