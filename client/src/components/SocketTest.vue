<template>
  <div id="app">
  <p>
    My name is <input type="text" id="Name" v-model="name">
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
import axios from 'axios';

export default defineComponent({
  name: 'SocketTest',
  data() {
    return {
      name: '',
    };
  },
  methods: {
    save() {
      axios
        .post('http://localhost:3000', this.name)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  /* setup() {
    function save() {
      const myuuid = uuidv4();
      console.log(`Your UUID is: ${myuuid}`);
    }
    return {
      save,
    };
  }, */
});

</script>
