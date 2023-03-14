<script setup>
import {onMounted} from "vue";
import axios from "axios";
import {ref, reactive} from "vue";
import {useRouter} from 'vue-router'
import Vue3TagsInput from 'vue3-tags-input';

import FileInfoItem from "../components/FileInfoItem.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {getToken} from "@/store";

const router = useRouter();

const pageInfo = reactive({
  totalPages: 1,
  pageNumber: 0,
});

const handleChangeTag = (tags) => {
  search.excelInfoIdList = tags;
};

const fileList = ref([]);
const date = ref([]);

const idCondition = ref("NONE");
const nameCondition = ref("NONE");

const search = reactive({
  excelInfoIdList: null,
  idCondition: null,
  fileName: null,
  nameCondition: null,
  minCreatedAt: null,
  maxCreatedAt: null,
  sort: "createdAt,desc"
});

const searchFile = () => {
  if (date.value !== null) {
    search.minCreatedAt = date.value[0];
    search.maxCreatedAt = date.value[1];
  } else {
    search.minCreatedAt = null;
    search.maxCreatedAt = null;
  }

  search.idCondition = idCondition.value == "NONE" ? null : idCondition.value;
  search.nameCondition = nameCondition.value == "NONE" ? null : nameCondition.value;

  if (search.excelInfoIdList == "") {
    search.excelInfoIdList = null;
  }

  if (search.fileName == "") {
    search.fileName = null;
  }

  console.log(search);
  getFileList();
};

const movePage = (value) => {
  pageInfo.pageNumber = value - 1;
  getFileList(pageInfo.pageNumber);
};

const createUI = () => {
  router.push("/create");
};

const updateUI = () => {
  router.push("/update");
};

const getFileList = () => {
  search.page = pageInfo.pageNumber;
  axios({
    method: "GET",
    url: "/api/excels",
    params: search,
  }, {
    headers: {
      "Authorization" : "Bearer " + getToken(),
    }
  })
      .then((response) => {
        let data = response.data.response;
        fileList.value = data.content;
        pageInfo.totalPages = data.totalPages;
        console.log(response.data.response);
      })
      .catch((error) => {
        console.log(error);
      });
};

onMounted(() => {
  console.log(getToken());
  getFileList(0);
});
</script>

<template>
  <div class="container container-border">
    <div>
      <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1"><b>IdList</b></span>
        <select v-model="idCondition" class="form-select option-width" id="inputGroupSelect"
                aria-label="Example select with button addon">
          >
          <option>NONE</option>
          <option>IN</option>
          <option>NOT_IN</option>
        </select>
        <vue3-tags-input class="form-control" aria-label="AccountId"
                         aria-describedby="basic-addon1" @on-tags-changed="handleChangeTag" value="" />
      </div>
      <div class="input-group mt-3 mb-3">
        <label class="input-group-text" for="inputGroupSelect"><b>FileName</b></label>
        <select v-model="nameCondition" class="form-select option-width" id="inputGroupSelect"
                aria-label="Example select with button addon">
          <option>NONE</option>
          <option>EQUAL</option>
          <option>LIKE</option>
        </select>
        <input type="text" class="form-control" placeholder="Username" @input="search.fileName = $event.target.value"
               value=""/>
      </div>
      <VueDatePicker class="mb-3" model-type="yyyy-MM-dd'T'HH:mm:ss" v-model="date" range/>

      <div class="btn-group">
        <button type="button" class="btn btn-primary mb-3" @click="searchFile">
          검색
        </button>
        <button type="button" class="btn btn-primary mb-3" @click="createUI">
          생성
        </button>
        <button type="button" class="btn btn-primary mb-3" @click="updateUI">
          데이터 관리
        </button>
      </div>
    </div>
    <table class="table table-hover">
      <thead>
      <tr>
        <th>ID</th>
        <th>FileName</th>
        <th>CreatedAt</th>
        <th>Button</th>
      </tr>
      </thead>
      <tbody v-for="item in fileList" :key="item.id">
      <FileInfoItem v-bind="item" @getFileList="getFileList"/>
      </tbody>
    </table>
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ active: n - 1 === pageInfo.pageNumber }" v-for="n in pageInfo.totalPages">
        <a class="page-link" @click="movePage(n)">{{ n }}</a>
      </li>
    </ul>
  </div>
</template>

<style>
.container-border {
  padding: 2em;
}

.option-width {
  max-width: 120px;
}
</style>
