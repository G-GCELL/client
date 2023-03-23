<script></script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/search">
        <img src="/src/assets/Gabia_Logo.png" alt="" width="100" height="40">
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/search">파일 목록</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/create">파일 생성</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/update">데이터셋 업데이트</router-link>
          </li>
        </ul>

        <div class="d-flex">
          <div class="p-2">로그인 회원 정보</div>
          <button class="btn btn-outline-danger" type="submit">로그아웃</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.container-fluid {
  margin-left: 150px;
  margin-right: 200px;
}

.p-2 {
  margin-right: 10px;
}

.router-link-active {
  color: black;
  font-weight: bold;
}
</style>