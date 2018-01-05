<template>
  <div id="earth">
    <panel-title title="用户管理"></panel-title>
    <span v-if="!isDetails">
      <search placeholder="账号信息/绑定手机号" @search="searchKeyword"></search>
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="request">
            <div class="form_group ">
              <p>注册类型</p>
              <el-select v-model='register' placeholder="请选择日志类型">
                <el-option v-for="item in register_options" :label="item.label" :value="item.value" :key="item.key"></el-option>
              </el-select>

            </div>
            <div class="form_group">
              <el-button type="primary" class="request_btn" :loading="btnLoading" @click="requestHistory">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="request_table">
            <span class="f_right">
              <el-button-group>
                <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
              </el-button-group>
            </span>
            <el-table
              :data="userTable"
              v-loading="tableLoading"
              style="width: 100%">
              <el-table-column
                prop="userid"
                label="账号信息">
              </el-table-column>
              <el-table-column
                prop="phoneNumber"
                label="绑定手机号">
              </el-table-column>
              <el-table-column
                prop="registerType"
                label="注册类型"
                width="100">
                <template slot-scope="scope">
                  <span v-if="scope.row.registerType == 0">APP</span>
                  <span v-else-if="scope.row.registerType == 1">微信</span>
                  <span v-else>未知注册类型</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="registerTime"
                label="注册时间">
              </el-table-column>
              <el-table-column
                prop="recentLoginTime"
                label="最近登录时间">

              </el-table-column>
              <el-table-column
                prop="recentLoginTime"
                label="查看详情">
                <template slot-scope="scope">
                  <p class="problem" @click="viewDetails(scope.row.userid)">查看</p>
                </template>
              </el-table-column>

            </el-table>
          </div>
        </el-col>
      </el-row>
    </span>
    <user-detail v-else :userid="userid" @backuser="backUsers"></user-detail>
  </div>
</template>
<script type="text/javascript">
import search from '@/components/search'
import panelTitle from '@/components/panel_title'
import userDetail from '@/components/user/user-detail'
var base64 = require('base-64')

export default {
    name: 'user',

    data() {
      return {
        userTable: [],
        tableLoading: false,
        btnLoading: false,
        page: 1,
        pageMax: false,
        register: '',
        register_options: [
          { value: '', label: '全部'},
          { value: '0', label: 'APP'},
          { value: '1', label: '微信'}
        ],
        isDetails: false,
        userid: '',
        keyword: ''
      }
    },
    components: {
      search,
      panelTitle,
      userDetail
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getUserList()
    },
    methods: {

      getUserList(name, data, page){
        const that = this;
        this.tableLoading = true
        this.$jquery.post(that.$request, {
          action: 'user_list',
          admin_id: that.admin_id,
          account: name,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.userTable = res.data
          } else {
            that.$message({
              type: 'error',
              message: res.msg
            })
          }

          if(res.data.length > 0){
            this.pageMax = false
          } else {
            this.pageMax = true;
          }
          this.tableLoading = this.btnLoading =  false;
        }, 'json')
      },
      searchKeyword( keyword ){
        this.keyword = keyword;
        this.getUserList( keyword )
      },

      //按条件查询
      requestHistory(){
        const that = this;
        this.btnLoading = true;
        var params = {
          type: that.register,
        }
        params = base64.encode(JSON.stringify(params))
        this.getUserList(that.keyword, params, 1)
      },

      turnPage( direction ){
        var that = this;
        var page = this.page;
        var params = {
          type: that.register
        }
        if( direction == 'left'){
          page--
        } else {
          page++
        }

        params = base64.encode(JSON.stringify(params))
        this.getUserList(that.keyword, params, page)
        this.page = page;
      },

      //查看详情
      viewDetails( id ){
        console.log(id)
        this.userid = id;
        this.isDetails = true;

      },
      backUsers(){
        this.isDetails = false;
      }
    }
  }
</script>
<style lang="scss">
#earth{
  padding: 0 20px;

  .request{
    background: white;
    border: 1px solid #ddd;
    padding: 0 20px;
    margin-top: 20px;
    padding-top: 20px;
    p{
      font-size: 14px;
      margin:0px;
      margin-bottom: 5px;
    }

    .el-date-editor.el-input, .el-select{
      width: 100%;
    }
    .form_group{
      margin-bottom: 20px;
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
  .problem{
    color: #eaa262;
    text-decoration: underline;
    cursor: pointer;
  }
}

</style>
