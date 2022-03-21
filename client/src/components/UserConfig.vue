<template>
  <div class="modal" id="userconfig" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">User Permissions</h5>
          <button type="button"
                  id="equation-editor-close"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close">
          </button>
        </div>
        <div class="modal-body" id ="mainBody">
            <table class ="table" id = "usertable">
                <thead>
                    <th scope="col">#</th>
                    <th scope="col">Username</th>
                    <th scope="col">Allow Editing</th>
                    <th scope="col">Kick</th>
                </thead>
                <tbody id = "tBody">
                </tbody>
            </table>
        </div>
        <div class="modal-footer">
          <button type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="hidden-div">
    <span id="hidden-katex-output" class="canvas-katex"></span>
  </div>
  <!-- <div id="html-to-canvas-div"></div> -->
</template>
<script lang="ts">
import {
  defineComponent, Ref, ref, watch, watchEffect,
} from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'bootstrap';
import katex from 'katex';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { StoreKey } from '@/symbols';
import { useAxios } from '@/utils/useAxios';
import { store } from '@/store/index';
import * as outgoingMessageHandler from '@/services/synchronization/outgoingMessageHandler';

export default defineComponent({
  props: {
    modalID: {
      type: String,
      required: true,
    },
  },
});
function kickClicked(kickedUser: string) {
  console.log(kickedUser);
  outgoingMessageHandler.kickUser(kickedUser);
}
function editClicked(selectedUser: string, canEdit : boolean) {
  console.log(selectedUser);
  outgoingMessageHandler.editing(selectedUser, canEdit);
}

export function updateUserList() {
  console.log('test');
  axios.get('./api/rooms/userperm', {
    params: {
      roomID: store.state.userID.roomID,
    },
  }).then((value) => {
    const table = document.getElementById('usertable') as HTMLTableElement;
    const tbody = document.createElement('tbody');
    table.replaceChild(tbody, document.getElementById('tBody')!);
    tbody.id = 'tBody';
    let x = 0;
    value.data.forEach((element: any) => {
      if (element.userID !== store.state.userID.ID) {
        const row = tbody.insertRow(-1);
        const numCol = row.insertCell(-1);
        numCol.innerHTML = x.toString();

        const nameCol = row.insertCell(-1);
        nameCol.innerHTML = element.name;

        const editBtn = document.createElement('button');
        if (element.canEdit) {
          editBtn.innerHTML = 'allowed';
        } else {
          editBtn.innerHTML = 'restricted';
        }
        editBtn.onclick = function () {
          editClicked(element.userID, !element.canEdit);
          if (editBtn.innerHTML === 'allowed') {
            editBtn.innerHTML = 'restricted';
          } else {
            editBtn.innerHTML = 'allowed';
          }
        };
        const editCol = row.insertCell(-1);
        editCol.appendChild(editBtn);

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = 'Kick';
        removeBtn.onclick = function () {
          kickClicked(element.userID);
          updateUserList();
        };
        const removeCol = row.insertCell(-1);
        removeCol.appendChild(removeBtn);
        // eslint-disable-next-line no-plusplus
        x++;
      }
    });
    console.log(value.data);
  });
}

</script>

<style>
.hidden-div {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.katex {
  font-size: 4rem;
}
.canvas-katex {
  font-size: 10rem;
}
</style>
