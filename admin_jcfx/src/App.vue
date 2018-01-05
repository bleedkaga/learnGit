<template>
  <div id="app" >
    <router-view></router-view>
  </div>
</template>

<script>
import login from '@/components/login'
import AMap from 'AMap'
export default {
  name: 'app',
  data(){
    return {
      is_login: '',
      username:  ''
    }
  },
  components: {
    login
  },

}
</script>

<style lang="scss">
@import './assets/styles/style.css';
.panel_group{
  padding: 0 20px;
  p{
    margin:0;
    margin-bottom: 10px;
  }
  .block{
    margin-bottom: 20px;
  }
  .el-input{
    width: 100%;
  }
  .el-select{
    width: 100%;
  }
  .el-button{
    display: block;
    width: 100%;
    margin-top: 200px;

  }
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
#header{
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  width: 100%;

  .user_container{
    float: right;
    width: 260px;
    line-height: 57px;
    a{
      padding-left: 20px;
    }
  }

}
#logo {
  float: left;
  width: 180px;
  background-color: #34495e;
  line-height:56px;
  height: 56px;
  text-align: center;
}
.panel_title{
  margin-right: 0px !important;
}

/*消息历史*/

#earth{
  padding: 0 20px;
  .history_detail{
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    background: white;
    display: block;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .request{
    background: white;
    overflow: hidden;
    border: 1px solid #ddd;
    padding:20px;
    margin-top: 20px;
    p{
      font-size: 14px;
    }
    .el-date-editor.el-input{
      width: 100%;
    }
    p + * {
      margin-bottom: 10px;
    }
  }
  .panel_detail{
    width: 80%;
    margin: 30px auto;
    border: 1px solid #ddd;
    background: white;
    .top{
      text-align: center;
      font-size: 16px;
      padding: 40px 0;
      border-bottom: 1px solid #ddd;
    }
    .body{
      padding: 30px;
      font-size: 14px;
    }
  }
  .request_table{
    background: white;
    border: 1px solid #ddd;
    padding: 20px;
    margin-top: 20px;
  }
  .request_btn{
    display: block;
    width: 100%;
    margin-top: 100px;
    margin-bottom:20px;
  }
  .f_right{
    float: right;
    margin-bottom: 20px;
  }
}
</style>
