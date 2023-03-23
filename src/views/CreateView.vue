<script setup>
import axios from "axios";
import { reactive } from "vue";
import { useRouter } from 'vue-router'
import {progressStore, getToken, setComplete} from "../store";
import { EventSourcePolyfill } from 'event-source-polyfill';
import Header from "@/components/layout/Header.vue";

import Vue3TagsInput from 'vue3-tags-input';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const router = useRouter();

const inputValue = reactive({
  fileName: null,
  columnNames: ["account_id", "start_date", "end_date", "product_code", "cost"],
  accountIdStatus: "NONE",
  accountId: [],
  productCodeStatus: "NONE",
  productCode: [],
  startDate: ["2022-01-01T00:00:00", "2023-12-31T00:00:00"],
  endDate: ["2022-01-01T00:00:00", "2023-12-31T00:00:00"],
  costMin: "0",
  costMax: "10000",
});

const columnNamesValue = [
  "account_id",
  "start_date",
  "end_date",
  "product_code",
  "cost",
];

const handleChangeTag = (tags) => {
  inputValue.accountId = tags;
};

const mappingValue = () => {
  const returnValue = {
    fileName: inputValue.fileName,
    costMin: inputValue.costMin,
    costMax: inputValue.costMax,
  };

  returnValue.columnNames = sortColumnNames(inputValue.columnNames);
  console.log(inputValue.accountId);
  switch (inputValue.accountIdStatus) {
    case "IN":
      returnValue.inAccountId = inputValue.accountId;
      break;
    case "NOTIN":
      returnValue.notAccountId = inputValue.accountId;
      break;
  }

  switch (inputValue.productCodeStatus) {
    case "IN":
      returnValue.inProductCode = inputValue.productCode;
      break;
    case "NOTIN":
      returnValue.notProductCode = inputValue.productCode;
      break;
  }

  if (inputValue.startDate.length > 0) {
    returnValue.startDateMin = inputValue.startDate[0];
    returnValue.startDateMax = inputValue.startDate[1];
  } else {
    returnValue.startDateMin = formattingDateTime(new Date(0));
    returnValue.startDateMax = formattingDateTime(new Date());
  }

  if (inputValue.endDate.length > 0) {
    returnValue.endDateMin = inputValue.endDate[0];
    returnValue.endDateMax = inputValue.endDate[1];
  } else {
    returnValue.endDateMin = formattingDateTime(new Date(0));
    returnValue.endDateMax = formattingDateTime(new Date());
  }

  return returnValue;
};

const sortColumnNames = (array) => {
  let resultArray = [];
  columnNamesValue.forEach((element) => {
    if (array.includes(element)) {
      resultArray.push(element);
    }
  });
  return resultArray;
};

const formattingDateTime = (date) => {
  return date.toISOString().substring(0, 17);
};

const createFile = () => {
  const create = mappingValue();
  console.log(create);
  axios({
    method: "POST",
    url: "/api/excels",
    data: create,
    headers: {
      Authorization : "Bearer " + getToken(),
    }
  })
      .then((response) => {
        let url = response.data.response;
        let excelInfoId = Number(url.substring(8, url.length));
        progressStore.set(excelInfoId, "0");

        const completeSse = new EventSourcePolyfill("/api/connect/file/" + excelInfoId, {
          headers : {
            Authorization : "Bearer " + getToken(),
          },
          heartbeatTimeout: 1200000,
          withCredentials: true,
        });

        completeSse.addEventListener("CONNECT", function (event) {
          console.log(event);
          console.log("connect");
        });

        completeSse.addEventListener("FILE_CREATION_COMPLETE", function (event) {
          let message = JSON.parse(event.data);
          download(message.excelInfoId, message.fileName);
          setComplete(message.excelInfoId);
        });

        completeSse.addEventListener("ERROR", function (event) {
          let message = JSON.parse(event.data);
          alert(message.errorMessage);
          setComplete(message.excelInfoId);
        });

        router.push("/search");
      })
      .catch((error) => {
        alert("생성에 실패하였습니다.\n" + error.response.data.error.message);
        console.log(error.response.data);
      });
};

const download = (fileId, fileName) => {
  axios({
    method: "GET",
    url: '/api/excels/' + fileId,
    responseType: "blob",
    headers: {
      Authorization : "Bearer " + getToken(),
    }
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName + '.xlsx');
    document.body.appendChild(link);
    link.click();
  }).catch((error) => {
    console.log(error.response);
  });
}

const wiki = () => {
  window.open("https://mentoring-gitlab.gabia.com/mentee/mentee_2023.01/team/weat/gcell-api-server/-/wikis/%EC%97%91%EC%85%80-%ED%8C%8C%EC%9D%BC-%EC%83%9D%EC%84%B1-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%BC%80%EC%9D%B4%EC%8A%A4");
}
</script>

<template>
  <Header/>
  <div class="container container-border">
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>컬럼 항목</b></span>
      <div class="form-control">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="accountIdCheckbox" v-model="inputValue.columnNames"
                 value="account_id" />
          <label class="form-check-label" for="accountIdCheckbox"><b>계정 ID</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="startDateCheckbox" v-model="inputValue.columnNames"
                 value="start_date" />
          <label class="form-check-label" for="startDateCheckbox"><b>시작일시</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="endDateCheckbox" v-model="inputValue.columnNames"
                 value="end_date" />
          <label class="form-check-label" for="endDateCheckbox"><b>종료일시</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="productCodeCheckbox" v-model="inputValue.columnNames"
                 value="product_code" />
          <label class="form-check-label" for="productCodeCheckbox"><b>상품 코드</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="costCheckbox" v-model="inputValue.columnNames"
                 value="cost" />
          <label class="form-check-label" for="costCheckbox"><b>비용</b></label>
        </div>
      </div>
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>파일 이름</b></span>
      <input type="text" class="form-control" placeholder="파일 이름" aria-label="FileName" aria-describedby="basic-addon1"
             @input="inputValue.fileName = $event.target.value" value="" />
      <div class="valid-feedback">Valid.</div>
      <div class="invalid-feedback">Please fill out this field.</div>
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>계정 ID</b></span>
      <select class="form-select option-width" id="account-id-select" v-model="inputValue.accountIdStatus"
              aria-label="Example select with button addon">
        >
        <option>NONE</option>
        <option>IN</option>
        <option>NOTIN</option>
      </select>
      <vue3-tags-input class="form-control" aria-label="AccountId"
             aria-describedby="basic-addon1" @on-tags-changed="handleChangeTag" value="" />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text" id="product-code-select"><b>상품 코드</b></span>
      <select class="form-select option-width" id="product-code-select" v-model="inputValue.productCodeStatus"
              aria-label="Example select with button addon">
        >
        <option>NONE</option>
        <option>IN</option>
        <option>NOTIN</option>
      </select>
      <div class="form-control">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonS3-checkbox" v-model="inputValue.productCode"
                 value="AmazonS3" />
          <label class="form-check-label" for="AmazonS3-checkbox"><b>AmazonS3</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonCloudFront-checkbox" v-model="inputValue.productCode"
                 value="AmazonCloudFront" />
          <label class="form-check-label" for="AmazonCloudFront-checkbox"><b>AmazonCloudFront</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonCloudWatch-checkbox" v-model="inputValue.productCode"
                 value="AmazonCloudWatch" />
          <label class="form-check-label" for="AmazonCloudWatch-checkbox"><b>AmazonCloudWatch</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonEC2-checkbox" v-model="inputValue.productCode"
                 value="AmazonEC2" />
          <label class="form-check-label" for="AmazonEC2-checkbox"><b>AmazonEC2</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonECS-checkbox" v-model="inputValue.productCode"
                 value="AmazonECS" />
          <label class="form-check-label" for="AmazonECS-checkbox"><b>AmazonECS</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonLightsail-checkbox" v-model="inputValue.productCode"
                 value="AmazonLightsail" />
          <label class="form-check-label" for="AmazonLightsail-checkbox"><b>AmazonLightsail</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonRDS-checkbox" v-model="inputValue.productCode"
                 value="AmazonRDS" />
          <label class="form-check-label" for="AmazonRDS-checkbox"><b>AmazonRDS</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonRoute53-checkbox" v-model="inputValue.productCode"
                 value="AmazonRoute53" />
          <label class="form-check-label" for="AmazonRoute53-checkbox"><b>AmazonRoute53</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AmazonSumerian-checkbox" v-model="inputValue.productCode"
                 value="AmazonSumerian" />
          <label class="form-check-label" for="AmazonSumerian-checkbox"><b>AmazonSumerian</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AWSCloudTrail-checkbox" v-model="inputValue.productCode"
                 value="AWSCloudTrail" />
          <label class="form-check-label" for="AWSCloudTrail-checkbox"><b>AWSCloudTrail</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AWSELB-checkbox" v-model="inputValue.productCode"
                 value="AWSELB" />
          <label class="form-check-label" for="AWSELB-checkbox"><b>AWSELB</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="AWSLambda-checkbox" v-model="inputValue.productCode"
                 value="AWSLambda" />
          <label class="form-check-label" for="AWSLambda-checkbox"><b>AWSLambda</b></label>
        </div>
      </div>
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text"><b>시작일시</b></span>
      <VueDatePicker class="form-control date-picker-style" v-model="inputValue.startDate"
                     model-type="yyyy-MM-dd'T'HH:mm:ss" range />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text"><b>종료일시</b></span>
      <VueDatePicker class="form-control date-picker-style" v-model="inputValue.endDate"
                     model-type="yyyy-MM-dd'T'HH:mm:ss" range />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text"><b>비용</b></span>
      <input type="number" class="form-control" @input="inputValue.costMin = $event.target.value" value="0" />
      <span class="input-group-text">~</span>
      <input type="number" class="form-control" @input="inputValue.costMax = $event.target.value" value="10000" />
    </div>

    <button type="button" class="btn btn-primary mb-3" @click="createFile">
      생성
    </button>
    <button type="button" class="btn btn-success mb-3 right-button" @click="wiki">
      생성 조건 가이드
    </button>
  </div>
</template>

<style>
.container-border {
  padding: 2em;
}

.date-picker-style {
  padding: 2px;
}

.option-width {
  max-width: 100px;
}
.right-button{
  float: right;
}
</style>

