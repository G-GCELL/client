<script setup>
import axios from "axios";
import { reactive } from "vue";
import { useRouter } from 'vue-router'

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import {getToken} from "@/store";
import Header from "@/components/layout/Header.vue";

const router = useRouter();

const inputValue = reactive({
  deleteTarget: null,
  csvFile: null
});
const send = () => {
  const formdata = new FormData();
  if (inputValue.deleteTarget != null) {
    formdata.append('deleteTarget', inputValue.deleteTarget);
  }
  if (inputValue.csvFile != null) {
    formdata.append('file', inputValue.csvFile);
  }
  axios({
    method: "POST",
    url: "/api/dataset",
    data: formdata,
    headers: {
      Authorization : "Bearer " + getToken(),
    }
  })
      .then(() => {
        alert("업데이트 작업을 추가하였습니다.");
        router.push("/");
      })
      .catch((error) => {
        alert("업데이트에 실패하였습니다.\n" + error.response.data.error.message);
        console.log(error.response.data);
      });
};

</script>

<template>
  <Header/>
  <div class="container container-border">

    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>업데이트 대상 연월</b></span>
      <input type="month" class="form-control" aria-label="deleteTarget" aria-describedby="basic-addon1"
             @input="inputValue.deleteTarget = $event.target.value" value="" />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>CSV 파일 업로드</b></span>
      <input type="file" class="form-control" aria-label="csvFile" aria-describedby="basic-addon1"
             @input="inputValue.csvFile = $event.target.files[0]" value="" />
    </div>

    <button type="button" class="btn btn-primary mb-3" @click="send">
      업데이트
    </button>
  </div>
</template>

<style>
.container-border {
  padding: 2em;
}
</style>

