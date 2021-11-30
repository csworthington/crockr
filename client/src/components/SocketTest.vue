<template>
  <div id="app">
  <p>
    My name is <input v-model="name">
  </p>
<p>
    <button @click="save">Save</button>
  </p>
</div>
  <router-view/>
</template>

<script lang="ts">
/* eslint-disable no-shadow */
import { v4 as uuidv4 } from 'uuid';
import { computed, defineComponent, WritableComputedRef } from 'vue';

export default defineComponent({
  setup() {
    function save() {
      const myuuid = uuidv4();

      console.log(`Your UUID is: ${myuuid}`);
    }
    return {
      save,
    };
  },
});

</script>
