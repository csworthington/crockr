<template>
  <div id="app">
  My name is <input v-model="message" placeholder="edit me">
<p>Message is: {{ message }}</p>
</div>
  <router-view/>
</template>
