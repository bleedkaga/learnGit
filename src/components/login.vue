<template lang="html">
  <div class="login">
    <div class="splash">
      <div class="color-line"></div>
      <div class="login-container">
        <div class="row">
            <div class="col-md-12">
                <div class="text-center m-b-md">
                    <h3>请登录</h3>
                </div>
                <div class="hpanel">
                    <div class="panel-body">
                      <div  id="loginForm">
                          <div class="form-group">
                              <label class="control-label" >用户名</label>
                              <input type="text" v-model="username" placeholder="请输入用户名" class="form-control" @keyup.enter="login">
                          </div>
                          <div class="form-group">
                              <label class="control-label" >密码</label>
                              <input type="password" v-model="password" placeholder="请输入密码" class="form-control" @keyup.enter="login">
                          </div>
                          <el-button type="primary" @click="login" :loading="loading" @keyup.enter="login">登录</el-button>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data(){
    return {
      username: '',
      password: '',
      loading: false,
    }
  },
  methods: {
    login(){
      console.log(this)
      var that = this;
      if(this && that.username == ''){
        this.$message({ type: 'error', message: '请输入用户名'})
        return
      }
      if(this && that.password == ''){
        this.$message({ type: 'error', message: '请输入密码'})
        return
      }

      var request  = this.$request, name = this.username, password = this.password;

      this.loading = true;
      this.$jquery.post(that.$request, {
        action: 'login',
        username: name,
        password: password
      }, res => {
        console.log(res)
        if( res.error_code == '0') {
          const userdata = {
            admin: {
              username: res.data.admin_name,
              login: true,
              admin_id: res.data.admin_id
            }
          }

          sessionStorage.setItem('user', JSON.stringify(userdata))
          that.$message({ type: 'success', message: '登录成功' })
          setTimeout( () => {
            that.$router.push({ path: 'datashow' })
          }, 500)

        } else {

          that.$message({
            type: 'error',
            message: res.msg
          })

        }

        that.loading = false;
      }, 'json')


    }
  }
}
</script>

<style lang="scss" scoped>
*{ box-sizing: border-box;}
h3{
  font-size: 24px;
}
.color-line{
  background: #f7f9fa;
  height: 6px;
  background-image: -webkit-linear-gradient(left, #34495e, #34495e 25%, #9b59b6 25%, #9b59b6 35%, #3498db 35%, #3498db 45%, #62cb31 45%, #62cb31 55%, #ffb606 55%, #ffb606 65%, #e67e22 65%, #e67e22 75%, #e74c3c 85%, #e74c3c 85%, #c0392b 85%, #c0392b 100%);
  background-image: -moz-linear-gradient(left, #34495e, #34495e 25%, #9b59b6 25%, #9b59b6 35%, #3498db 35%, #3498db 45%, #62cb31 45%, #62cb31 55%, #ffb606 55%, #ffb606 65%, #e67e22 65%, #e67e22 75%, #e74c3c 85%, #e74c3c 85%, #c0392b 85%, #c0392b 100%);
  background-image: -ms-linear-gradient(left, #34495e, #34495e 25%, #9b59b6 25%, #9b59b6 35%, #3498db 35%, #3498db 45%, #62cb31 45%, #62cb31 55%, #ffb606 55%, #ffb606 65%, #e67e22 65%, #e67e22 75%, #e74c3c 85%, #e74c3c 85%, #c0392b 85%, #c0392b 100%);
  background-image: linear-gradient(to right, #34495e, #34495e 25%, #9b59b6 25%, #9b59b6 35%, #3498db 35%, #3498db 45%, #62cb31 45%, #62cb31 55%, #ffb606 55%, #ffb606 65%, #e67e22 65%, #e67e22 75%, #e74c3c 85%, #e74c3c 85%, #c0392b 85%, #c0392b 100%);
  background-size: 100% 6px;
  background-position: 50% 100%;
  background-repeat: no-repeat;
}
.text-center{
  text-align: center;
}
.m-b-md{
  margin-bottom: 20px;
}
.splash{
  background-color: #f1f3f6
}
.hpanel {
    background-color: none;
    border: none;
    box-shadow: none;
    margin-bottom: 25px;
}
.login-container{
    max-width: 420px;
    margin: auto;
    padding-top: 6%;
}
.form-group{ margin-bottom: 20px;}
label{
    display: inline-block;
    max-width: 100%;
    margin-bottom: 5px;
    font-weight: bold;
}
.form-control{
    display: block;
    width: 100%;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
    -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
    -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
}
.el-button{
  width:100%;
  background-color:#74d348;
  border: 1px solid #74d348
}
.btn{
    text-rendering: auto;
    color: initial;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: block;
    text-align: start;
    width: 100%;
    margin: 0em;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: normal;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    border-radius: 4px;
    color: white;
}
</style>
