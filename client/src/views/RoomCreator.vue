<template>
  <div class="room" id = "room">
    <h1>This is the room Creation page</h1>
    <label for="fname">Please enter the name of the room</label><br>
    <input type="text" id="roomName" name="roomName" value=""><br>
    <span><button @click="createRoom" >CreateRoom</button></span>
  </div>

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import router from '@/router';
import { StoreKey } from '@/symbols';
import { useAxios } from '@/utils/useAxios';

export default defineComponent({
  setup() {
    const axios = useAxios();
    const store = useStore(StoreKey);
    function createRoom() {
      const name = <HTMLInputElement> document.getElementById('roomName');
      axios.get('./api/rooms/createroom', {
        params: {
          name: name.value,
          userID: store.state.userID.ID,
        },
      }).then((value) => {
        store.commit('userID/updateRoomID', value);
        router.push('/canvas');
      });
    }
    return {
      createRoom,
    };
  },
});
</script>
