/* eslint-disable no-shadow */
export interface ColourPaletteState {
  primaryToolColour: string;
  secondaryToolColour: string;
}

const state: ColourPaletteState = {
  primaryToolColour: '#0000ff',
  secondaryToolColour: '#00ff00',
};

const mutations = {
  /**
   * Update the primary drawing tool colour. Only accepts RGB hex strings. Will throw
   * error if passed invalid string.
   * @param {ColourPaletteState} state Current state of the store
   * @param {string} newColour The new RGB hex string to set the colour to
   */
  updatePrimaryToolColour(state: ColourPaletteState, newColour: string): void {
    // check that string is correct
    const rgbRegex = /^#(?:[0-9a-fA-F]{3}){2}$/gm;
    if (rgbRegex.test(newColour)) {
      state.primaryToolColour = newColour;
    } else {
      throw new Error(`Invalid RGB string "${newColour}". String must be a valid RGB hex string`);
    }
  },
  /**
   * Update the secondary drawing tool colour. Only accepts RGB hex strings. Will throw
   * error if passed invalid string.
   * @param {ColourPaletteState} state Current state of the store
   * @param {string} newColour The new RGB hex string to set the colour to
   */
  updateSecondaryToolColour(state: ColourPaletteState, newColour: string): void {
    // check that string is correct
    const rgbRegex = /^#(?:[0-9a-fA-F]{3}){2}$/gm;
    if (rgbRegex.test(newColour)) {
      state.secondaryToolColour = newColour;
    } else {
      throw new Error(`Invalid RGB string "${newColour}". String must be a valid RGB hex string`);
    }
  },
};

export const colourPalette = {
  namespaced: true,
  state,
  mutations,
};
