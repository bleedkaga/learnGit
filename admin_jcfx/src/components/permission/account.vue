<template>
  <div id="earth">
    <panel-title title="管理员账号管理"></panel-title>
    <div class="earth_container">
      <el-row>
        <el-col :span="24">
          <div class="table">
            <div class="operation">
              <span slot-scope="scope" >
                <el-button size="small" @click="createAdminAccount"><i class="el-icon-plus"></i></el-button>
              </span>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                  <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
                </el-button-group>
              </span>
            </div>

            <!-- @selection-change="handleSelectionChange" -->
            <el-table
              ref="multipleTable"
              :data="adminList"
              tooltip-effect="dark"
              v-loading="tableLoading"
              style="width: 100%" >
              <el-table-column
                width="5">
              </el-table-column>
              <el-table-column
                prop="name"
                label="用户名"
                width="80"
                align="center">
              </el-table-column>
              <el-table-column
                prop="roleName"
                label="角色名称"
                width="180"
                align="center">
              </el-table-column>
              <el-table-column
                prop="privilege"
                label="角色权限"
                width="900"
                align="center">
              </el-table-column>
              <el-table-column
                prop="status"
                label="状态"
                align="center"
                show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="scope.row.status == 0">启用</span>
                  <span v-else >禁用</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="remark"
                label="备注"
                width="120"
                align="center">
              </el-table-column>
              <el-table-column
                prop="adminid"
                label="修改"
                align="center"
                show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-button icon="edit" size="small" @click="modifyAdminInformation(scope.row)">修改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="管理员管理" :visible.sync="dialogAdminCountVisible" >
      <div class="admin_account_management">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="form_group">
              <p>手机号码<i>*</i></p>

              <el-input v-if="adminid == ''"  type="number" v-model="adminAccount.phoneNumber" placeholder="请输入手机号码"></el-input>
              <span v-else>{{adminAccount.phoneNumber}}</span>
            </div>
            <div class="form_group">
              <p>用户名<i>*</i></p>
              <el-input v-if="adminid == ''" v-model="adminAccount.account" placeholder="请输入用户名"></el-input>
              <span v-else>{{adminAccount.account}}</span>
            </div>
            <div class="form_group">
              <p>登录密码<i>*</i></p>
              <el-input v-model="adminAccount.password" type="password" placeholder="请输入登录密码"></el-input>
            </div>
            <div class="form_group">
              <p>确认登录密码<i>*</i></p>
              <el-input v-model="adminAccount.confirmedPassword" type="password" placeholder="请输入确认登录密码"></el-input>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="form_group">
              <p>是否启用<i>*</i></p>
              <el-select v-model="adminAccount.status" placeholder="请选择是否启用">
                <el-option v-for="item in adminAccount.enable_options" :label="item.label" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </div>
            <div class="form_group">
              <p>关联角色<i>*</i></p>
              <el-select v-model="adminAccount.roleids" placeholder="请选择关联角色">
                <el-option v-for="item in adminAccount.associated_options" :label="item.roleName" :value="item.roleid" :key="item.roleid"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="form_group">
              <p>描述</p>
              <el-input type="textarea" v-model="adminAccount.remark" placeholder="请输入描述信息"></el-input>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAdminCountVisible = false">取 消</el-button>
        <el-button v-if="adminid=='' " type="primary" @click="saveAdminAccountInformation" :loading="saveInformationLoading">添 加</el-button>
        <el-button v-else type="primary" @click="modifyAdminAccountInformation" :loading="saveInformationLoading">修改</el-button>
      </span>
    </el-dialog>

  </div>


</template>
<script type="text/javascript">
import search from '@/components/search'
import panelTitle from '@/components/panel_title'
var base64 = require('base-64')
const cityOptions = ['上海', '北京', '广州', '深圳'];
export default {
    name: 'earthMagnetic',
    data() {
      return {
        warning: false,
        deleteCheckebox: false,
        adminid: '',
        adminList: [],
        dialogAdminCountVisible: false,
        tags: '',

        tableLoading: false,
        page: 1,
        pageMax: false,
        selectedParkingRow: [],
        saveInformationLoading: false,
        adminAccount: {
          phoneNumber: '',
          account: '',
          password: '',
          confirmedPassword: '',
          status: '0',
          enable_options: [
            {value: '0', label: '启用'},
            {value: '1', label: '禁用'},
          ],
          roleid: '',
          associated_options: [],
          remark: ''
        }
      }
    },
    components: {
      search,
      panelTitle
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getAdminAccountList()
      this.getRolesList()
    },
    methods: {

      getAdminAccountList( page ){
        const that = this;
        this.tableLoading = true;
        this.$jquery.post(that.$request, {
          action: 'admin_list',
          admin_id: that.admin_id,
          page: page
        }, res => {

          if(res.error_code == '0'){
            this.adminList = res.data;
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }

          if( res.data.length > 0){
            this.pageMax = false;
          } else {
            this.pageMax = true;
          }

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
        this.getAdminAccountList(page)
        this.page = page;
      },

      //表格选中
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.gwid) )
        })
      },

      //添加管理员
      createAdminAccount(){
        this.adminid = ''
        this.dialogAdminCountVisible = true;
        this.adminAccount = {
          phoneNumber: '',
          account: '',
          password: '',
          confirmedPassword: '',
          status: '0',
          enable_options: [
            {value: '0', label: '启用'},
            {value: '1', label: '禁用'},
          ],
          roleids: '',
          associated_options: [],
          remark: ''
        };
        this.getRolesList()
      },

      //获取角色列表
      getRolesList(){
        const that = this;

        this.$jquery.post(that.$request, {
          action : 'admin_role_list',
          admin_id: that.admin_id
        }, res => {

          if( res.error_code == '0'){
            this.adminAccount.associated_options = res.data;
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      //保存管理账户信息
      saveAdminAccountInformation(){
        const that = this;
        var save = that.adminAccount;
        if(save.password != save.confirmedPassword){
          this.$message({ type: 'error', message: '请确认密码'})
          return
        }
        if(!(/^1[34578]\d{9}$/.test(save.phoneNumber))){
          this.$message({ type: 'warning', message: '请输入合法的手机号码！'})
          return
        }
        var saveInformation = {
          account: encodeURI(save.account),
          password: save.password,
          phoneNumber: save.phoneNumber,
          status: save.status,
          roleid: save.roleids,
          remark: encodeURI(save.remark)
        }
        this.saveInformationLoading = true;
        this.$jquery.post( that.$request, {
          action: 'admin_add',
          admin_id: that.admin_id,
          adminid: that.adminid,
          data: base64.encode(JSON.stringify(saveInformation))
        }, res => {
          if( res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '保存成功'
            })
            this.getAdminAccountList()
            this.dialogAdminCountVisible = false;
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.saveInformationLoading = false;
        }, 'json')
      },

      //修改管理员信息
      modifyAdminAccountInformation(){

        const that = this;
        var save = that.adminAccount;
        if(save.password != save.confirmedPassword){
          this.$message({ type: 'error', message: '请确认密码'})
          return
        }
        if(!(/^1[34578]\d{9}$/.test(save.phoneNumber))){
          this.$message({ type: 'warning', message: '请输入合法的手机号码！'})
          return
        }
        var saveInformation = {
          // account: encodeURI(save.account),
          password: save.password,
          adminid: this.adminid,
          // phoneNumber: save.phoneNumber,
          status: save.status,
          roleid: save.roleids,
          remark: encodeURI(save.remark)
        }
        this.saveInformationLoading = true;
        this.$jquery.post( that.$request, {
          action: 'admin_edit',
          admin_id: that.admin_id,
          adminid: that.adminid,
          data: base64.encode(JSON.stringify(saveInformation))
        }, res => {

          if( res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '修改成功'
            })
            this.dialogAdminCountVisible = false;
            this.getAdminAccountList()
          } else {
            this.$message({ type: 'error', message: res.msg })
          }
          this.saveInformationLoading = false;
        }, 'json')
      },
      modifyAdminInformation( obj ){
        this.dialogAdminCountVisible = true;
        var ruleList = this.adminAccount.associated_options;

        this.adminid = obj.adminid;
        this.adminAccount = {
          account: obj.account,
          password: obj.password,
          phoneNumber: obj.phoneNumber,
          status: obj.status,
          roleids: obj.roleNo,
          remark: obj.remark,
          associated_options: ruleList,
          enable_options: [
            {value: '0', label: '启用'},
            {value: '1', label: '禁用'},
          ],
        }

      }
    }
  }
</script>
<style lang="scss">
.admin_account_management{
  i{
    color: red;
  }
  .el-select{
    width: 100%;
  }
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
.form_group{
  p{
    margin:0;
    margin-bottom: 5px;
  }
  margin-bottom: 20px;
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

  .select_tags_all{
    padding: 10px 0;

  }
  .tags{
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    margin-bottom: 20px;
  }
</style>
