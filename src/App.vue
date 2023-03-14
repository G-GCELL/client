<script setup>
import { RouterView } from "vue-router";
import { progressStore, getToken } from "./store";
import { EventSourcePolyfill } from 'event-source-polyfill';

const token = getToken();
if(token){
  const progressSse = new EventSourcePolyfill("/api/connect", {
    headers : {
      Authorization : "Bearer " + token,
    },
    heartbeatTimeout: 1200000,
    withCredentials: true,
  });

  progressSse.addEventListener("CONNECT", function (event) {
    console.log(event);
    console.log("connect progress");
  });

  progressSse.addEventListener("FILE_CREATION_PROGRESS", function (event) {
    const message = JSON.parse(event.data);
    progressStore.set(message.excelInfoId, message.progressRate);
  });
}
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
