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
    LastMessage: {{ lastMsg }}
  </div>
  <div>
    Log:
    <ul id="message-list">
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
  Ref,
} from 'vue';

import { mapState, useStore } from 'vuex';
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

    const chatRenderKey = ref(0);
    const forceRerender = (): void => { chatRenderKey.value += 1; };

    const createMessage = (content: string): ChatMessage => ({
      id: getUUID(),
      message: content,
      timestamp: new Date().toISOString(),
    });

    const store = useStore(StoreKey);
    const socket = new WebSocket(process.env.VUE_APP_WEB_SOCKET_URL);
    const chatInput = ref('');
    const messages: Ref<ChatMessage[]> = ref([createMessage('hi'), createMessage('bye')]);
    const lastMsg = ref('');
    // const messages = reactive(store.getters['chat/displayMessages']);

    const updateMessages = async (newMessages: ChatMessage[]) => {
      messages.value = newMessages;
    };

    const unsubscribeFromChat = store.subscribe((mutation, storeObj) => {
      if (mutation.type === 'chat/ADD_MESSAGE') {
        // updateMessages(store.getters['chat/displayMessages']);
        lastMsg.value = mutation.payload.message;
      }
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

    socket.addEventListener('open', (ev: Event) => {
      socket.addEventListener('message', (evt: MessageEvent) => {
        const listParent = document.getElementById('message-list') as HTMLUListElement;
        if (listParent) {
          console.log('appending...');
          const entry = document.createElement('li');
          entry.appendChild(document.createTextNode(evt.data));
          listParent.appendChild(entry);
        } else {
          console.log('no list found');
        }
        console.log('message received');
        console.log(evt.data);
        store.commit('chat/ADD_MESSAGE', createMessage(evt.data));
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
      lastMsg,
      chatRenderKey,
    };
  },
});
</script>
