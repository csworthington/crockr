export class Emitter<T = any> {
  private listeners: Map<any, any>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Add event listener
   * @param label Event name
   * @param callback  Callback
   * @param vm this object (Vue Instance)
   * @return {boolean}
   */
  addListener(label: T, callback: (...params: T[]) => void, vm: T): boolean {
    if (typeof callback === 'function') {
      // add if label does not exist
      // eslint-disable-next-line no-unused-expressions
      this.listeners.has(label) || this.listeners.set(label, []);
      // Add callback function to label
      this.listeners.get(label).push({ callback, vm });
      return true;
    }
    return false;
  }

  /**
   * Remove a listener from this emitter
   * @param label Event name
   * @param callback Callback
   * @param vm this object
   * @return {boolean}
   */
  removeListener(label: T, callback: () => void, vm: T): boolean {
    // Get the current event from the listener list
    const listeners = this.listeners.get(label);
    let index;

    if (listeners && listeners.length) {
      // Find the position of the current event in the event monitoring list
      // eslint-disable-next-line @typescript-eslint/no-shadow
      index = listeners.reduce((i: number, listener: any, index: number) => {
        if (
          typeof listener.callback === 'function'
          && listener.callback === callback
          && listener.vm === vm
        ) {
          // eslint-disable-next-line no-param-reassign
          i = index;
        }
        return i;
      }, -1);

      if (index > -1) {
        // Remove event
        listeners.splice(index, 1);
        this.listeners.set(label, listeners);
        return true;
      }
    }
    return false;
  }

  /**
   * Trigger monitor
   * @param label Event name
   * @param args parameter
   * @return {boolean}
   */
  emit(label: string, ...args: T[]): boolean {
    // Get events stored in the event list
    const listeners = this.listeners.get(label);

    if (listeners && listeners.length) {
      listeners.forEach(
        (listener: { callback: (...params: T[]) => void; vm: T }) => {
          // Extend the callback function to have methods in listener.vm
          listener.callback.call(listener.vm, ...args);
        },
      );
      return true;
    }
    return false;
  }
}

export default new Emitter();
