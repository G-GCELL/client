<script setup>
import { RouterView } from "vue-router";
import { progressStore } from "./store";

const progressSse = new EventSource("/api/connect");

progressSse.addEventListener("CONNECT", function (event) {
  console.log(event);
  console.log("connect progress");
});

progressSse.addEventListener("FILE_CREATION_PROGRESS", function (event) {
  const message = JSON.parse(event.data);
  progressStore.set(message.excelInfoId, message.progressRate);
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
