<template>
  <div id="earth">
    <panel-title title="车位锁密码管理"></panel-title>
    <search placeholder="请输入车位编号"  @search="searchKeyword"></search>

    <div class="earth_container" >
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="earth_query">
            <div class="form_group">
              <p>车位锁状态</p>
              <div class="block">
                <el-select v-model="parkingLocks.state" placeholder="请选择状态">
                  <el-option
                     v-for="item in parkingLocks.options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
                   </el-option>
                </el-select>
              </div>
            </div>

            <div class="form_group">
              <p>停车场</p>
              <div class="block">
                <el-select v-model="parkingLocks.parking" placeholder="请选择停车场">
                  <el-option
                     v-for="item in parkingLocks.parking_options"
                     :key="item.pid"
                     :label="item.name"
                     :value="item.pid">
                   </el-option>
                </el-select>
              </div>
            </div>

            <div class="form_group query">
              <el-button type="primary" :loading="requestLoading" @click="requestCondition">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="table">
            <div class="operation">
              <span slot-scope="scope" >
                <el-button size="small" :type="setting" @click="modifying">未设置</el-button>
                <el-button size="small" :type="settinged" @click="modifyed">已设置</el-button>
              </span>

            </div>
            <!-- 未设置 -->
            <template  v-if="!settingPaimary">
              <parkinglockPassword :data="data" @setcomplete="reloadset" @turnpage="turnPage"></parkinglockPassword>
            </template>

            <template  v-else>
              <parkinglockPassworded :data="data" @deleted="reloadSetComplete" @turnpage="turnPage"></parkinglockPassworded>
            </template>

          </div>
        </el-col>
      </el-row>
    </div>


  </div>
</template>
<script type="text/javascript">
var base64 = require('base-64')
import panelTitle from '@/components/panel_title';
import parkinglockPassword from '@/components/earthManagement/parkinglockPasswordNot';
import parkinglockPassworded from '@/components/earthManagement/parkinglockPassworded';
import search from '@/components/search';
export default {
    name: 'earthMagnetic',
    data() {
      return {
        settingPaimary: false,
        parkingName: '',
        parkingLocks: {
          state: '',
          options: [
            { value: '0', label: '未连接'},
            { value: '1', label: '升起'},
            { value: '2', label: '降下'},
            { value: '3', label: '外力碰撞'},
            { value: '4', label: '升起受阻'},
            { value: '5', label: '硬件故障'},
          ],
          parking:'',
          parking_options: []
        },
        parkinglockPasswordList: [],
        data: [],

        locksLoading: false,
        requestLoading: false,
        pageMax: false,
        page: 1,
        label: false,

        setLocation: false,
        locParkingname: '',
        loid: '',

        isManagement: false,
        selectedParkingRow: []
      }
    },
    components: {
      search,
      panelTitle,
      parkinglockPassword,
      parkinglockPassworded
    },
    computed: {
      settingPasswordDisabled: function(){
        return this.selectedParkingRow.length == 0
      },
      settinged: function(){
        return this.settingPaimary ? 'primary' : 'default'
      },
      setting: function(){
        return !this.settingPaimary ? 'primary' : 'default'
      }
    },
    mounted(){
      const that = this;
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;

      this.parkingLocks.parking = this.$route.query.parkinglot_id
      var requestParams = {
        status: that.parkingLocks.state,
        parkinglot: that.parkingLocks.parking
      }

      this.getParkingspaceList()
      this.getParkingLockPassList(0, 1)
    },
    methods: {
      updatePassword( loid ){
        var loids = [];
        loids.push(loid)
        this.handlerSettingPassword(loids)
      },

      handleSelectionChange( index ){
        this.selectedParkingRow = [];
        var arr = this.selectedParkingRow;
        if( index ){
          index.forEach( i => {
             arr.push( parseFloat(i.loid) )
          })
        }
        this.selectedLabel = index;
      },


      searchKeyword( keyword ){
        this.parkingNo = keyword;
        this.getParkingLockPassList()
      },

      turnPage( res ){
        // 0为设置密码，1已设置密码
        this.getParkingLockPassList(res.isPassword, res.page)
      },

      reloadSetComplete(){
        this.settingPaimary = true
        this.getParkingLockPassList(1, 1)
      },

      reloadset(){
        this.settingPaimary = false
        this.getParkingLockPassList(0, 1)
      },

      getParkingLockPassList( ispaasword, page){
        const that = this;
        var params = {
          "admin_id": that.admin_id,
          "parkingNo": that.parkingNo,
          "ispaasword": ispaasword,
          "page": page,
          "data":{
              "status": that.parkingLocks.status,
              "parkinglot": that.parkingLocks.parking
          }
        }
        this.$jquery.post(that.$request + '?action=parking_lockpass_list', JSON.stringify(params), function( res ){

          if(res.error_code == '0'){
            that.data = res.data;
          } else {

          }

         if(res.error_code == '0' && ispaasword == 0){
          this.settingPaimary = false
         }

         if(res.error_code == '0' && ispaasword == 1){
          this.settingPaimary = true
         }

          that.pageMax = res.data ? false : true;
          that.requestLoading = false;
        }, 'json')
      },

      modifying(){
        this.settingPaimary = false;
        // 0为设置密码，1已设置密码
        this.getParkingLockPassList(0, 1)
      },
      modifyed(){
        this.settingPaimary = true
        this.getParkingLockPassList(1, 1)
      },


      //获取停车场
      getParkingspaceList(){
        const that = this;

        this.$jquery.get(that.$request, {
          action: 'parkinglot_admin_all',
          admin_id: that.admin_id
        }, res => {
          that.parkingLocks.parking_options = res.data;
        }, 'json')
      },


      //按条件查询车位锁
      requestCondition(){
        this.requestLoading = true;
        const that = this;

        this.getParkingLockPassList(0, 1)
      },

      handlerSettingPassword( loid ){
        const that = this;

        var par = {
          "admin_id":that.admin_id,
          "loid": loid
        }
        that.$jquery.post(that.$request + '?action=parking_lockpass_set', JSON.stringify(par), res => {
          if( res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})
          }
        }, 'json')
      },

      deletePassword( row ){
        this.$confirm('此操作将会清除该车位锁密码, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handlerDeletePassword(row.loid)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      handlerDeletePassword(loid){
        const that = this;
        var par = {
          admin_id: that.admin_id,
          loid: loid
        }
        this.$jquery.post(that.$request + '?action=parking_lockpass_clear', JSON.stringify(par), res => {
          if(res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})
          } else {
            that.$message({type: 'error', message: res.msg})
          }

          that.$emit("deleted", {isPassword: 1, page: that.page})
        }, 'json')
      }
    }
  }
</script>
<style lang="scss">

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

  .panel_title{
    text-align: left;
    background: white;
    margin: 10px;
    margin-top: 30px;
    margin-left: 0px;
    padding: 30px 10px;
    font-size: 20px;
    border: 1px solid #ddd;
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
