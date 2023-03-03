<script setup>
import axios from "axios";
import { ref } from "vue";
import { progressStore } from "../store";

const props = defineProps({
  excelInfoId: Number,
  fileName: String,
  createdAt: String,
  status: String,
});

const excelStatus = ref(props.status);
const excelFileName = ref(props.fileName);

const download = () => {
  axios({
    method: "GET",
    url: "/api/excels/" + props.excelInfoId,
    responseType: "blob",
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", props.fileName + ".xlsx");
      document.body.appendChild(link);
      link.click();
    })
    .catch((error) => {
      console.log(error.response);
      alert("다운로드에 실패하였습니다.\n" + error.response.data.error.message);
    });
};

const deleteFile = () => {
  axios({
    method: "DELETE",
    url: "/api/excels/" + props.excelInfoId,
  }).then((response) => {
    console.log(response);
    alert("삭제가 완료되었습니다.")
    excelStatus.value = "DELETED";
  }).catch((error) => {
    alert("삭제에 실패하였습니다.\n" + error.response.data.error.message);
    console.log(error);
  });
};

const updateFileName = () => {
  const fileName = prompt();
  axios({
    method: "PATCH",
    url: "/api/excels/" + props.excelInfoId,
    data: {
      fileName: fileName,
    },
  })
    .then((response) => {
      alert("변경이 완료되었습니다.");
      excelFileName.value = fileName;
    })
    .catch((error) => {
      alert("변경이 실패하였습니다.\n" + error.response.data.error.message);
      console.log(error);
    });
};
</script>

<template>
  <tr>
    <td>{{ excelInfoId }}</td>
    <td>{{ excelFileName }}</td>
    <td>{{ createdAt }}</td>
    <td>
      <div v-if="excelStatus !== 'CREATING'" class="btn-group">
        <button
          type="button"
          class="btn btn-outline-primary btn-sm"
          :disabled="excelStatus === 'DELETED'"
          @click="download"
        >
          Download
        </button>
        <button
          type="button"
          class="btn btn-outline-success btn-sm"
          :disabled="excelStatus === 'DELETED'"
          @click="updateFileName"
        >
          Update
        </button>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          :disabled="excelStatus === 'DELETED'"
          @click="deleteFile"
        >
          Delete
        </button>
      </div>
      <div v-else class="progress mt-1">
        <div
          id="dynamic"
          class="progress-bar progress-bar-success progress-bar-striped active"
          role="progressbar"
          aria-valuenow="0"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{ width: progressStore.get(excelInfoId) + '%' }"
        ></div>
      </div>
    </td>
  </tr>
</template>

<style></style>
