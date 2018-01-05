<template>
  <div id="earth">
    <panel-title title="角色管理"></panel-title>

    <div class="earth_container">
      <el-row :gutter="0">
        <el-col :span="24">
          <div class="table">

            <div class="operation">
              <el-button-group>
                <el-button size="small" @click="createAccount"><i class="el-icon-plus"></i> </el-button>
                <el-button size="small" @click="deleteAdminAccount" :disabled="selectedParkingRow.length == 0"><i class="el-icon-delete"></i> </el-button>
              </el-button-group>
              <span class="f_right">
                <el-button-group>
                  <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                  <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
                </el-button-group>
              </span>
            </div>

            <el-table  ref="multipleTable" :data="userTable" tooltip-effect="dark" v-loading="tableLoading"  style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column
                type="selection"
                @select="handleSelectionChange"
                width="55">
              </el-table-column>
              <el-table-column
                prop="roleName"
                label="角色名称"
                width="120"
                align="center">

              </el-table-column>
              <el-table-column
                prop="privilege"
                label="角色权限"
                >
              </el-table-column>

              <el-table-column
                prop="parkinglotName"
                label="所属停车场"
                >
              </el-table-column>

              <el-table-column
                prop="menuNo"
                label="修改"
                align="center"
                width="100"
                show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-button size="small" type="primary" icon="edit" @click="changeAccount(scope.row, scope.row.$index)"> 修改</el-button>
                </template>
              </el-table-column>
            </el-table>

          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="角色管理" size="large" :visible.sync="dialogChangeAccountVisible" >
      <div class="account_change_content" v-loading="menuLoading">
        <div class="account"> <i style="color: red">*</i> 角色名称: <span><el-input v-model="roleName"></el-input></span></div>
        <div class="permisson_list">
          <el-row :gutter="10">
            <el-col class="el-col-auto" :span="2" v-for="(item, index) in directorys" :key="index">
              <div class="device">
                <div class="head">
                  <!-- <input :data-menuno="item.menuNo" type="checkbox" @click="select(index)"  name="" > {{item.menuName}} -->
                  <el-checkbox :label="item.menuNo" v-model="checkModel" @change="checkAllItem"></el-checkbox>{{item.menuName}}
                </div>
                <div class="body">
                  <span v-for="val in item.nodes">
                    <!-- <input :data-menuno="val.menuNo" @click="getMeno" type="checkbox"  name="" > {{val.menuName}} -->
                    <el-checkbox :label="val.menuNo" v-model="checkModel"></el-checkbox>{{val.menuName}}
                  </span>
                </div>
              </div>
            </el-col>
            <el-col class="el-col-auto parkinglots" :span="2">
              <div class="device">
                <div class="head">
                  <el-checkbox @change="handlerCheckAllParking" v-model="selectedAllParkinglot"></el-checkbox> 所有停车场
                </div>
                <div class="body">
                  <span v-for="city in parkings_options">
                    <el-checkbox  :label="city.pid" :key="city.pid" v-model="checkAllParkings"></el-checkbox> {{city.name}}
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>

        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button  @click="dialogChangeAccountVisible = false">取 消</el-button>
        <el-button v-if="roleid == '' "type="primary" @click="saveAdminAccountRoles('role_add')" >保 存</el-button>
        <el-button v-else type="primary" @click="saveAdminAccountRoles('role_edit')" >修 改</el-button>
      </div>
    </el-dialog>

  </div>


</template>
<script type="text/javascript">
import search from '@/components/search'
import panelTitle from '@/components/panel_title'
import roleColumn from '@/components/permission/column';
var base64 = require('base-64')
const cityOptions = ['上海', '北京', '广州', '深圳'];
var selectMeno = [];
var allPakings = [];  //所有停车场
import $ from 'jquery';
export default {
    name: 'earthMagnetic',
    data() {
      return {
        checkAll: true,
        userTable: [],
        tableLoading:  false,
        page: 1,
        pageMax: false,
        selectedParkingRow: [],
        dialogChangeAccountVisible: false,
        directorys: [],
        menuLoading: false,
        roleName: '',
        menuNo: [],
        btnLoading: false,
        checkeds: [],
        selectMeno: [],
        roleid: '',
        deleteRoleVisible: false,
        //新增停车场列表
        parkings_options: [],
        selectParkinglots: [],

        checkModel: [],
        checkAllParkings: [],

        //是否选中所有停车场
        selectedAllParkinglot: false
      }
    },
    watch: {
      checkAllParkings: function(){
        if(this.checkAllParkings.length === this.parkings_options.length){
          this.selectedAllParkinglot = true
        } else {
          this.selectedAllParkinglot = false
        }
      },
    },
    components: {
      search,
      panelTitle,
      roleColumn
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getUserList();

      Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
          if (this[i] == val) return i;
        }
        return -1;
      };
      Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
          this.splice(index, 1);
        }
      };
    },
    methods: {

      //角色选择所有停车场
      handlerCheckAllParking(event){
        this.checkAllParkings = event.target.checked ? allPakings : []
        this.selectedAllParkinglot = event.target.checked ? true : false
      },

      //获取停车场
      getParkingSpace(){
        var that = this;
        that.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, {}, function( res ){
          if(res.error_code == '0'){
            that.parkings_options = res.data;
            res.data.forEach( item => {
              allPakings.push(item.pid)
            })
          } else {
            that.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      checkAllItem(){},

      //保存管理账户角色
      saveAdminAccountRoles(actionName){
        const that = this;
        if(that.checkModel.length == 0){
          this.$message({ type: 'warning', message: '请选择角色权限'})
          return
        }
        if(that.roleName == ''){
          this.$message({ type: 'warning', message: '请填写角色名称'})
          return
        }
        console.log('checkAllParkings, ' + that.checkAllParkings)
        if(that.checkAllParkings.length == 0){
          that.$message({ type: 'warning', message: '请勾选所管理的停车场' })
          return
        }

        var params = base64.encode(JSON.stringify(that.checkModel));
        var parkinglotId = base64.encode(JSON.stringify(that.checkAllParkings))
        var requestData = {
          action: actionName,
          admin_id: that.admin_id,
          roleid: that.roleid,
          name: that.roleName,
          menuNo: params,
          parkinglotId: parkinglotId
        }

        this.btnLoading = true;
        this.$jquery.post(that.$request, requestData,  res => {
          if( res.error_code == '0'){
            this.$message({ type: 'success',  message: '操作成功' })
            this.getUserList()

            //关闭对话框 及 清除上次提交的数据
            this.dialogChangeAccountVisible = false;
            this.selectedAllParkinglot = false;
            this.roleid = [];
            this.checkModel = []
            this.checkAllParkings = [];
          } else {
            this.$message({ type: 'error',  message: res.msg })
          }
          this.btnLoading = false;
        }, 'json')
      },

      //列表选中
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.roleid) )
        })
      },

      //获取目录
      getUserMenu( obj ){
        const that = this;
        const $    = this.$jquery;
        this.menuLoading = true;

        this.$jquery.post( that.$request, {
          action: 'role_menu',
          admin_id: that.admin_id
        }, res => {
          if( res.error_code == '0'){
            this.directorys = res.menu;

          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
            this.menuLoading = false
          }
          this.menuLoading = false;
        }, 'json')
      },

      //获取角色列表
      getUserList( page ){
        const that = this;
        this.tableLoading = true;
        this.$jquery.post( that.$request, {
          action: 'role_list',
          admin_id: that.admin_id,
          page: page
        }, res => {
          if( res.error_code == '0'){
            this.userTable = res.data;

          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
            this.tableLoading = false;
          }

          this.pageMax = res.data.length > 0 ? false : true;
          this.tableLoading = false;
        }, 'json')
      },

      //翻页
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getUserList(page)
        this.page = page;
      },

      //提示删除对话框
      deleteAdminAccount(){
        const that = this;
        this.deleteRoleVisible = true;
        this.$confirm('此操作将会删除所选的角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.handleDeleteRole()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      handleDeleteRole(){
        const that = this;
        this.$jquery.post( that.$request, {
          action: 'role_del',
          admin_id: that.admin_id,
          roleid: base64.encode(JSON.stringify(that.selectedParkingRow))
        }, res => {
          if( res.error_code === '0'){
            that.$message({type: 'success', message: '删除角色成功'})
            that.getUserList()
          } else {
            that.$message({type: 'error', message: res.msg})
          }
          this.deleteRoleVisible = false;
        }, 'json')
      },

      //修改角色
      changeAccount(obj, index){
        console.log('obj is ' + JSON.stringify(obj))
        var $ = this.$jquery;

        //预设选中的目录
        this.checkModel = obj.menu;

        //预设选中的停车场
        this.checkAllParkings = obj.parkinglot
        this.dialogChangeAccountVisible = true;

        //预设角色名 及 id
        this.roleName = obj.roleName;
        this.roleid = obj.roleid;

        this.getUserMenu(obj)
        this.getParkingSpace()
      },

      //添加角色
      createAccount(){

        this.dialogChangeAccountVisible = true;
        this.getUserMenu();
        this.getParkingSpace();

        //清除缓存： 栏目 所属停车场 角色名 角色id
        this.checkModel = []
        this.checkAllParkings = [];
        this.roleName = ''
        this.roleid = ''

      }
    }
  }
</script>
<style lang="scss">
.account_change_content{
  .account{
    span{ display: inline-block;}
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;
  }
  .table-parkinglot{
    padding: 10px;
  }
  .permisson_list{
    padding-top: 30px;
    .parkinglots{
      .device .body{
        max-height: 400px;
        overflow-y: scroll;
      }

      span{
        overflow: hidden;
        padding-bottom: 5px;
        em, input{
          float: left;
          font-style: normal;
          vertical-align: middle;
        }
        em{
          width: 150px;
        }
        input{
          margin-top: 5px;
        }
      }
    }
    .el-checkbox{
      display: block;
    }
    .device .head{
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .el-col-auto{
      width: 12.5%
    }
    .body, .head{
      margin-top: 10px;
      & > span{
        display: block;
        margin-bottom: 5px;
      }
      .el-checkbox{
        display: inline-block;
        margin-right: 5px;
      }
      .el-checkbox__label{
        display: none;
      }
    }
    .el-checkbox+.el-checkbox{
      margin-left: 0px;
      margin-top: 10px;
    }
  }
}
.el-dialog__footer{
  background: #f1f1f1;
  border-top: 1px solid #ddd;
}
.pay_record{
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  background: white;
  margin-bottom: 10px;
  overflow: hidden;
  display: flex;
  span{
    cursor: pointer;
  }
  .pay_record_search{
    width: 100%;
  }
  em{
    width: 79.5%;
    display: inline-block;
    font-style: normal;
  }
}
  #earth{
    padding: 0 20px;
    .earth_container{
      margin-top: 30px;
      .earth_query{
        padding: 20px;
        background: white;
        border: 1px solid #bfcbd9;
      }
      .el-select{
        width: 100%;
      }
      .form_group{
        margin-bottom: 20px;
      }
      .query{
        padding-top: 200px;
        button,input{
          width: 100%;
        }
      }
    }
    .operation{
      margin-bottom: 20px;
    }
    .table{
      background: white;
      padding: 20px;
      border: 1px solid #bfcbd9;
      border-radius: 2px;
    }
    .iconfont{
      font-size: 12px;
      margin: 0px;
    }
    .f_right{
      float: right;
    }
  }


</style>
