<template>
  <div>
    <span><button @click="createConnection">Create Connection</button></span>
    <!-- <span><button @click="sendPing">Ping</button></span> -->
  </div>
  <div>
    <span><input type="text" id="chatInput" name="chatInput" v-model="chatInput" /></span>
    <span><button @click="sendMessage">Send Message</button></span>
  </div>
  <div>
    Log:
    <ul>
      <li v-for="msg in messages" :key="msg.id">
        <span>"{{ msg.message }}"</span>
        <span>{{ msg.timestamp }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  ref,
  computed,
  Ref,
} from 'vue';

import { useStore } from 'vuex';
import getUUID from '@/utils/id-generator';
import { StoreKey } from '@/symbols';
import { ChatMessage } from '@/store/modules/chat';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export default defineComponent({
  setup() {
    const vm = getCurrentInstance() as ComponentInternalInstance;
    // const messages: Ref<Message[]> = ref([{
    //   id: getUUID(),
    //   sender: 'nobody',
    //   content: 'asdf1234',
    //   timestamp: Date.now(),
    // }]);

    const store = useStore(StoreKey);
    const socket = new WebSocket(process.env.VUE_APP_WEB_SOCKET_URL);
    const chatInput = ref('');
    const messages: Ref<ChatMessage[]> = ref([]);

    const computedMessages = computed((): ChatMessage[] => store.getters.displayMessages);

    // Subscribe to mutations
    // store.subscribe((mutation, state) => {
    //   if (mutation.type === 'chat/SEND_MESSAGE') {
    //     console.log(mutation.payload);
    //   }
    // });

    store.dispatch('chat/ADD_MESSAGE', {
      id: getUUID(),
      message: 'asdf',
      timestamp: new Date().toISOString(),
    });

    const createConnection = () => {
      console.log('in create conn');
      console.log(vm.proxy);
      if (vm.proxy !== null) {
        vm.proxy.$connect(process.env.VUE_APP_WEB_SOCKET_URL);
      } else {
        throw new Error('getCurrentInstance returned null, no globalProperties available');
      }
    };

    const createMessage = (content: string): ChatMessage => ({
      id: getUUID(),
      message: content,
      timestamp: new Date().toISOString(),
    });

    socket.addEventListener('open', (ev: Event) => {
      socket.addEventListener('message', (evt: MessageEvent) => {
        console.log('message received');
        console.log(evt.data);
        // messages.push(createMessage(evt.data, 'server'));
      });
    });

    const sendMessage = () => {
      console.log(chatInput.value);
      store.commit('chat/ADD_MESSAGE', createMessage(chatInput.value));
      // messages.push(createMessage(chatInput.value, 'client'));
      socket.send(chatInput.value);
      // console.log(messages);
      // if (vm.proxy !== null) {
      //   vm.proxy.$socket.send('data');
      // } else {
      //   throw new Error('getCurrentInstance returned null, no globalProperties available');
      // }
    };

    // window.setTimeout(() => { messages.push(createMessage('timed msg', 'timer')); }, 1000);

    return {
      createConnection,
      sendMessage,
      chatInput,
      messages,
      computedMessages,
    };
  },
});
</script>
