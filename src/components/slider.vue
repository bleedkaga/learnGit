<template>
  <div class="slider fixed-navbar fixed-sidebar">
    <div id="header" >
      <div class="color-line"></div>

      <div class="user_container">
        你好： <span>{{username}}</span>
        <a href="/#/password-cover">修改密码</a>
        <a  @click="logout">退出 <i class="el-icon-arrow-right"></i></a>
      </div>
    </div>

  <!-- Navigation -->
  <aside id="menu" >
    <div id="navigation">
        <div class="profile-picture">
            <a >
                <img src="../assets/logo-fx.png" class="img-circle m-b" alt="logo">
                <!-- <img src="../assets/logo.jpg" class="img-circle m-b" alt="logo"> -->
            </a>
        </div>
        <el-menu v-loading="loadingMenu" :default-active="defaultActive" class="el-menu-vertical-demo" :router="true" :unique-opened="true">
          <div class="loading_menu"></div>
          <span v-for="(item, index) in slider">
            <el-menu-item v-if="item.nodes.length == 0 && item.authority == '1'" :index="item.pageUrl" >{{item.menuName}}</el-menu-item>
            <el-submenu v-else-if="item.authority == '1'" :index="item.menuNo">
              <template slot="title"><i :class="item.iconclass"></i>{{item.menuName}}</template>
              <el-menu-item :index="it.pageUrl"  v-if="it.authority == '1'"  v-for="it in item.nodes" :key="it.index">{{it.menuName}}</el-menu-item>
            </el-submenu>
          </span>

        </el-menu>
      </div>
    </aside>
    <div id="wrapper" :style="{'min-height': height+'px'}" v-if="slider.length > 0">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

var base64 = require('base-64')
export default {
  name: 'hello',
  data () {
    return {
      loadingMenu: true,
      username: '',
      data: [],
      slider: [],
      defaultActive: ''
    }
  },
  watch: {
    '$route': "fetchDate"
  },
  computed: {
    height(){
      return (this.$jquery(window).height() - 105)
    }
  },
  beforeRouteEnter(to, from, next){
    next( vm => {
      setTimeout( () => {
        vm.defaultActive = to.path;
      }, 100)
    })
  },
  mounted(){
    const that = this;
    this.username = JSON.parse(sessionStorage.getItem('user')).admin.username;
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getMenu();

  },
  methods: {
    fetchDate(to, from){
      this.defaultActive = to.path || this.$router.history.current.path;;
    },
    logout(){
      this.$confirm('确认退出吗?', '退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('menu');
        this.$router.push('login')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '您取消了退出'
        });
      });
    },
    getMenu(){
      const that = this;

      if(sessionStorage.getItem('menu') == null){
        this.$jquery.post( that.$request, {
          action: 'menu',
          admin_id: that.admin_id
        }, res => {
          this.$jquery('.loading_menu').hide()
          this.loadingMenu = false;
          this.slider = res.menu;
          console.log(res.menu)
          for(var i in res.menu){
            if(res.menu[i].authority == "1"){
              for(var j in res.menu[i].nodes){
                if(res.menu[i].nodes[j].authority == "1"){
                  that.$router.push(res.menu[i].nodes[j].pageUrl)
                  break
                }
              }
              break
            }
          }
          sessionStorage.setItem('menu', JSON.stringify(res.menu));
        }, 'json')
      } else {
        this.slider = JSON.parse(sessionStorage.getItem('menu'))
        setTimeout( () => {
          that.loadingMenu = false;
          this.$jquery('.loading_menu').hide()
        }, 500)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  type="text/css">
@import 'https://at.alicdn.com/t/font_lvfl1brj4achm2t9.css';

#wrapper{
  border-top: 1px solid transparent;
  padding-top: 62px;
  padding-bottom: 30px;
}

.el-menu li{ border-bottom: 1px solid #e4e5e7; background: white; }
.el-menu-vertical-demo .loading_menu{ height: 100px; }
.el-tree{
  border:none;
  border-top: 1px solid #d1dbe5;
}
.iconfont{
  margin-right: 10px;
}
#wrapper .f_right, #wrapper .f_right .el-button-group{
  margin-right:0px;
}
#menu{
  z-index: 1100;
  margin-top: -56px;
  border-right: 1px solid #ddd;
}
#navigation .profile-picture{
  padding: 0px;
  border-bottom: 1px
}
#navigation .profile-picture .img-circle{
  width: 100%;
}
.pointer{
  cursor: pointer;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button{
    -webkit-appearance: none !important;
    margin: 0;
}

input[type="number"]{-moz-appearance:textfield;}



</style>
