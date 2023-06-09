<script setup>
import {onMounted} from "vue";
import axios from "axios";
import {ref, reactive} from "vue";
import {useRouter} from 'vue-router'
import Vue3TagsInput from 'vue3-tags-input';

import FileInfoItem from "../components/FileInfoItem.vue";
import Header from "@/components/layout/Header.vue";

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
  let idList = "";
  tags.forEach(tag => {
    idList = idList.concat(tag + ",");
  });
  idList = idList.substring(0, idList.length - 1);
  search.excelInfoIdList = idList;
};

const fileList = ref([]);
const date = ref([]);

const idCondition = ref("NONE");
const nameCondition = ref("NONE");
const status = ref("NONE");

const sortData = reactive({
  fileName : {
    name: "name",
    desc: false
  },
  createdAt: {
    name: "createdAt",
    desc: true
  }
});

const search = reactive({
  excelInfoIdList: null,
  idCondition: null,
  fileName: null,
  nameCondition: null,
  minCreatedAt: null,
  maxCreatedAt: null,
  sort: "createdAt,desc",
  status: null,
});

const sorting = (value) => {
  let str = null;
  switch (value){
    case sortData.fileName :
      str = sortData.fileName.name;
      if(!sortData.fileName.desc){
        str = str.concat(",desc");
        sortData.fileName.desc = true;
      }else{
        str = str.concat(",asc");
        sortData.fileName.desc = false;
      }
      break;
    case sortData.createdAt :
      str = sortData.createdAt.name;
      if(!sortData.createdAt.desc){
        str = str.concat(",desc");
        sortData.createdAt.desc = true;
      }else{
        str = str.concat(",asc");
        sortData.createdAt.desc = false;
      }
      break;
  }
  search.sort = str;
  console.log(search);
  searchFile();
}

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
  search.status = status.value == "NONE" ? null : status.value;

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
    headers: {
      Authorization : "Bearer " + getToken(),
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
  getFileList(0);
});
</script>

<template>
  <Header/>
  <div class="container container-border">
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>파일 ID</b></span>
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
      <label class="input-group-text" for="inputGroupSelect"><b>파일 이름</b></label>
      <select v-model="nameCondition" class="form-select option-width" id="inputGroupSelect"
              aria-label="Example select with button addon">
        <option>NONE</option>
        <option>EQUAL</option>
        <option>LIKE</option>
      </select>
      <input type="text" class="form-control" placeholder="파일 이름" @input="search.fileName = $event.target.value"
             value=""/>
    </div>

    <VueDatePicker class="mb-3" model-type="yyyy-MM-dd'T'HH:mm:ss" v-model="date" range/>

    <div class="input-group mt-3 mb-3">
      <span class="input-group-text" id="basic-addon1"><b>파일 상태</b></span>
      <select v-model="status" class="form-select" id="inputGroupSelect"
              aria-label="Example select with button addon">
        >
        <option>NONE</option>
        <option>CREATING</option>
        <option>CREATED</option>
        <option>DELETED</option>
      </select>
    </div>

    <button type="button" class="btn btn-primary mb-3" @click="searchFile">
      검색
    </button>

    <table class="table table-hover">
      <thead>
      <tr>
        <th>ID</th>
        <th @click="sorting(sortData.fileName)">파일 이름</th>
        <th @click="sorting(sortData.createdAt)">생성 일자</th>
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
