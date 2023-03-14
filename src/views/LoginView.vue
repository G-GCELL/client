<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const login = () => {
  location.href = "/api/oauth2/authorization/hiworks";
};

</script>

<template>
  <div class="container">
    <img class="logo" src="/src/assets/Gabia_Logo.png"/>
    <div class="border login-form">
      <button class="login-button" @click="login">hiworks로 로그인하기</button>
    </div>
  </div>
</template>

<style>
.logo{
  display: block;
  width: 30em;
  margin: 80px auto 0;
}
.login-form{
  width: 25em;
  height: 10em;
  margin: 2em auto;
  padding: 2.5em;
}
.login-button{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 110px;
  height: 50px;
  padding: 0 20px;

  color: #fff;
  background-color: #3090d6;

  border: 1px solid transparent;
  border-radius: 3px;
}
.login-button:hover{
  background-color: #2D81C1;
}
</style>
