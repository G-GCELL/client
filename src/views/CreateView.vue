<script setup>
import axios from "axios";
import { reactive } from "vue";
import { useRouter } from 'vue-router'
import { progressStore, getToken } from "../store";
import { EventSourcePolyfill } from 'event-source-polyfill';

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
        });

        completeSse.addEventListener("ERROR", function (event) {
          let message = JSON.parse(event.data);
          alert(message.errorMessage);
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
</script>

<template>
  <div class="container">
    <p class="h1 mt-4 mb-4">파일 생성</p>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>ColumnNames</b></span>
      <div class="form-control">
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="accountIdCheckbox" v-model="inputValue.columnNames"
                 value="account_id" />
          <label class="form-check-label" for="accountIdCheckbox"><b>계정아이디</b></label>
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
          <label class="form-check-label" for="productCodeCheckbox"><b>상품코드</b></label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="costCheckbox" v-model="inputValue.columnNames"
                 value="cost" />
          <label class="form-check-label" for="costCheckbox"><b>비용</b></label>
        </div>
      </div>
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>FileName</b></span>
      <input type="text" class="form-control" placeholder="FileName" aria-label="FileName" aria-describedby="basic-addon1"
             @input="inputValue.fileName = $event.target.value" value="" />
      <div class="valid-feedback">Valid.</div>
      <div class="invalid-feedback">Please fill out this field.</div>
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text" id="basic-addon1"><b>AccountId</b></span>
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
      <span class="input-group-text" id="product-code-select"><b>ProductCode</b></span>
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
      <span class="input-group-text"><b>StartDate</b></span>
      <VueDatePicker class="form-control date-picker-style" v-model="inputValue.startDate"
                     model-type="yyyy-MM-dd'T'HH:mm:ss" range />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text"><b>EndDate</b></span>
      <VueDatePicker class="form-control date-picker-style" v-model="inputValue.endDate"
                     model-type="yyyy-MM-dd'T'HH:mm:ss" range />
    </div>

    <div class="input-group mb-3">
      <span class="input-group-text"><b>Cost</b></span>
      <input type="number" class="form-control" @input="inputValue.costMin = $event.target.value" value="0" />
      <span class="input-group-text">~</span>
      <input type="number" class="form-control" @input="inputValue.costMax = $event.target.value" value="10000" />
    </div>
    <button type="button" class="btn btn-primary mb-3" @click="createFile">
      생성
    </button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .container {
    margin: 0 auto;
  }
}

.date-picker-style {
  padding: 2px;
}

.option-width {
  max-width: 100px;
}
</style>

