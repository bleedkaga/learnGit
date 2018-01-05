<template>
  <div id="earth">
    <panel-title title="车位锁管理"></panel-title>
    
    <parkinglock-maintain :parkinglockMaintainData="parkinglockMaintainData" v-if="component == 'maintain'" @back="component = 'default' "></parkinglock-maintain>
    
    <template v-else>
      
    
    <set-location :parkingname="locParkingname" :location="geoLocation" v-if="setLocation" @getlocation="saveLocation"  @back="setLocation = false"></set-location>
    
    <template v-else>
      <warning-notice :ty="ty" v-if="warningNoticeShow" @back="back"></warning-notice>
      <div class="pay_record" v-show="!warningNoticeShow">
        <span v-if="!pay_record_show"
              @click="pay_record_show = true"
              style="width: 20%; margin-top: 10px; margin-right:0.5%">
              <i class="el-icon-arrow-left"></i>
              告警消息
        </span>
        <!-- <em class="" :class="{'pay_record_search': pay_record_show == false }"> -->
          <el-input placeholder="请输入关键标签" v-model="parkingName" >
            <el-button slot="append" icon="search" @click="searchKeyword"></el-button>
          </el-input>
        <!-- </em> -->
      </div>
      <div class="earth_container" v-show="!warningNoticeShow">
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
                <span scope="scope" v-if="warning">
                  <el-button size="small" @click="addLabel" :disabled="selectedParkingRow.length == 0 || selectedParkingRow.length > 1"><i class="el-icon-plus"></i> 添加标签</el-button>
                  <el-button size="small" @click="tagsManagement" ><i class="iconfont icon-17"></i> 标签管理</el-button>
                  <el-button size="small" @click="upDownLocks('up')" :disabled="selectedParkingRow.length==0">↑ 升锁</el-button>
                  <el-button size="small" @click="upDownLocks('down')" :disabled="selectedParkingRow.length==0">↓ 降锁</el-button>
                  <el-button size="small" @click="warningNoticeHandler">告警消息</el-button>
                  <el-button size="small" type="primary" @click="exportParkingLocks" :disabled="selectedParkingRow.length==0">导出列表</el-button>
                </span>
                <span scope="scope" v-else>
                  <el-button size="small" type="primary">导出列表</el-button>
                </span>


                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                    <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
                  </el-button-group>
                </span>
              </div>

              <el-table
                ref="multipleTable"
                :data="parkingLocksData"
                tooltip-effect="dark"
                v-loading="locksLoading"
                style="width: 100%"
                align="center"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  align="center"
                  width="55">
                </el-table-column>
                <el-table-column
                  prop="serialNumber"
                  label="车锁串号"
                  width="165"
                  align="center">

                </el-table-column>
                <el-table-column
                  prop="parkingNo"
                  label="车位编号"
                  width="100"
                  align="center">

                </el-table-column>
                <el-table-column
                  prop="power"
                  label="车锁电量"
                  width="100"
                  align="center">
                  <template slot-scope="scope">
                    <span v-if="scope.row.power < 20" style="color: red">{{scope.row.power}}%</span>
                    <span v-else>{{scope.row.power}}%</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="车锁状态"
                  align="center"
                  width="100"
                  show-overflow-tooltip>
                  <template slot-scope="locks">
                    <span v-if="locks.row.status == 0">未连接</span>
                    <span v-else-if="locks.row.status == 1">升起</span>
                    <span v-else-if="locks.row.status == 2">降下</span>
                    <span v-else-if="locks.row.status == 3">外力碰撞</span>
                    <span v-else-if="locks.row.status == 4">升起受阻</span>
                    <span v-else-if="locks.row.status == 5">硬件故障</span>
                    <span v-else>未知</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="sensor"
                  align="center"
                  label="车锁地磁状态"
                  width="100"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="statusTime"
                  align="center"
                  label="状态更新时间"
                  width="200"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="parkinglotName"
                  label="所属停车场"
                  align="center"
                  width="200"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="noticeTel"
                  label="车锁离线通知电话"
                  align="center"
                  width="200"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="label"
                  label="标签名称"
                  width="120"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <!-- <span class="pointer" @click="editLabel(scope.row)">{{scope.row.label}}</span> -->
                    <span >{{scope.row.label}}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="location"
                  width="120"
                  label="车位锁位置"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span class="pointer" v-if="scope.row.location !== '' "  @click="viewLocation(scope.row)">{{scope.row.location}}</span>
                    <span class="pointer" v-else  @click="viewLocation(scope.row)">设 置</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="location"
                  width="120"
                  label="故障维修"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="readMaintainRecordHandle(scope.row)">查看记录</el-button>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="noticeState"
                  width="130"
                  label="通知状态修改"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button type="primary" v-if="scope.row.noticeState == '0'" size="small" @click="noticeStateEditHandle(scope.row, 1)">启用</el-button>
                    <el-button type="primary" v-else size="small" @click="noticeStateEditHandle(scope.row, 0)">禁用</el-button>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="noticeState"
                  width="100"
                  label="通知电话"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="noticeTelEditHandle(scope.row)">编 辑</el-button>
                  </template>
                </el-table-column>

              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>
      <label-management :ty="2" :loid="loid" :selectedLabel="selectedLabel" v-if="label" @cancel="cancel" @done="reInit" :isManagement="isManagement"></label-management>
    </template>
    </template>


    <el-dialog
      title="车锁离线通知电话填写"
      :visible.sync="noticeTelVisible">
      <el-input v-model="noticetel" placeholder="请输入离线通知电话号码"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="noticeTelVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitNoticeTelHandle">确 定</el-button>
      </span>
    </el-dialog>
  </div>


</template>
<script type="text/javascript">
var base64 = require('base-64')
import search from '@/components/search'
import warningNotice from '@/components/common/warning'
import labelManagement from '@/components/common/parking-lock-label'
import panelTitle from '@/components/panel_title';
import setLocation from '@/components/baseSetting/setLocationParking';

//故障与维修列表
import parkinglockMaintain from '@/components/parkingLock/parkinglockMaintain';

export default {
    name: 'earthMagnetic',
    data() {
      return {
        warningNoticeShow: false,
        pay_record_show: true,
        warning: true,
        parkingName: '',
        deleteCheckebox: false,
        iconDelete: false,
        checkAll: true,
        checkedCities: ['上海', '北京'],
        isIndeterminate: true,
        checkedTags: ['江北区'],
        checkList: ['江北区','江南区'],
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
        parkingLocksData: [],
        addTagsShow: false,
        tags: '',
        selectedParkingRow: [],
        locksLoading: false,
        requestLoading: false,
        pageMax: false,
        page: 1,
        label: false,

        setLocation: false,
        locParkingname: '',
        loid: '',

        isManagement: false,
        component: 'default',
        parkinglockMaintainData: {},

        noticeTelVisible:false,
        noticetel: ''
      }
    },
    components: {
      search,
      warningNotice,
      parkinglockMaintain,
      labelManagement,
      panelTitle,
      setLocation,
      
    },
    beforeRouteEnter(to, from, next){
      next()
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
      this.getParkingLocksList('',base64.encode(JSON.stringify(requestParams)), 1)
    },
    methods: {
      back(){
        this.warningNoticeShow = false
      },
      noticeStateEditHandle(row, state){
        const that = this;
        that.$jquery.post(that.$request, {
          action: 'lock_not_status',
          admin_id: that.admin_id,
          loid: row.loid,
          state: state
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getParkingLocksList();
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },
      noticeTelEditHandle(row){
        this.noticeTelVisible = true;
        this.loid = row.loid;
        this.noticetel = row.noticeTel
      },
      submitNoticeTelHandle(){
        const that = this;
        if(this.noticetel == ''){
          this.$message({
              type: 'warning',
              message: '请输入离线通知电话号码'
            })
          return;
        }
        that.$jquery.post(that.$request, {
          action: 'parking_lock_nottel',
          admin_id: that.admin_id,
          loid: that.loid,
          tel: that.noticetel
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.noticeTelVisible = false;
            this.getParkingLocksList();
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },
      //查看故障记录
      readMaintainRecordHandle( object ){
        this.component = 'maintain'
        this.parkinglockMaintainData = object;
      },
      reInit(){
        this.selectedParkingRow = [];
        this.getParkingLocksList();
      },
      //搜索关键字
      searchKeyword(){
        this.getParkingLocksList(this.parkingName)
      },

      //查看地图地址
      viewLocation( obj ){
        this.setLocation = true;
        this.locParkingname = obj.parkinglotName;
        this.loid = obj.loid;
        this.geoLocation = {
          x: obj.coordinateX,
          y: obj.coordinateY
        }
      },
      saveLocation( location ){
        this.setLocation = false;
        var data = {
          "coordinateX": location.lng,
          "coordinateY": location.lat,
          "location":encodeURI(location.address)
        }

        data = base64.encode(JSON.stringify(data));

        const that = this;
        that.$jquery.post(that.$request, {
          action: 'parking_lock_cooredit',
          admin_id: that.admin_id,
          loid: that.loid,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.getParkingLocksList();
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      warningNoticeHandler(){
        this.ty = 2
        this.warningNoticeShow = true
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

      //获取车位锁
      getParkingLocksList(name, data, page){
        const that = this;
        this.locksLoading = true
        this.$jquery.post(that.$request, {
          action: 'parking_lock_list',
          admin_id: that.admin_id,
          label_name: name,
          data: data,
          page: page
        }, res => {
          if( res.data.length > 0){
            that.pageMax = false
          } else {
            that.pageMax = true;
          }
          this.locksLoading = this.requestLoading =  false;
          that.parkingLocksData = res.data;
        }, 'json')
      },

      //导出车位锁
      exportParkingLocks(){
        const that = this;

        this.$jquery.post( that.$request, {
          action: 'parking_lock_exp',
          admin_id: that.admin_id,
          loid: base64.encode(JSON.stringify(that.selectedParkingRow))
        }, res => {
          window.location.href = that.$request+'?action=parking_lock_exp&admin_id='+that.admin_id+'&loid='+ base64.encode(JSON.stringify(that.selectedParkingRow));
        })
      },

      //升降锁操作
      upDownLocks( param){
        var param = param == 'up' ? 1 : 2;
        var that = this;

        this.$jquery.post( that.$request, {
          action: 'parking_lock_status',
          admin_id: that.admin_id,
          loid: base64.encode(JSON.stringify(that.selectedParkingRow)),
          ty: param
        }, res => {
          if(res.error_code == '0'){
            this.$message({ type: 'success', message: res.msg })
            this.getParkingLocksList();
          } else {
            this.$message({ type: 'error', message: res.msg })
          }
        }, 'json')
      },

      //按条件查询车位锁
      requestCondition(){
        this.requestLoading = true;
        const that = this;
        var requestParams = {
          status: that.parkingLocks.state,
          parkinglot: that.parkingLocks.parking
        }
        requestParams = base64.encode( JSON.stringify(requestParams) )
        this.getParkingLocksList(that.parkingName, requestParams, 1)
      },

      addLabel(){
        let loid = this.selectedParkingRow
        this.loid = loid
        this.label = true;
        this.isManagement = true
      },
      tagsManagement(){
        this.label = true;
        this.loid = '';
        this.selectedLabel = [];
        this.isManagement = false
      },
      editLabel(obj){
        this.isManagement = true;
        this.label = true;
        this.loid = obj.loid
      },
      cancel(){
        this.label = false;
        this.did = this.selectedParkingRow;
        this.getParkingLocksList()
      },
      //翻页
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getParkingLocksList(null, null, page)
        this.page = page;
      },

      deleteCheckeboxs(){
        this.cities.length = 0;
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
.form_group{
  margin-bottom: 20px;
  p{
    margin-bottom: 5px;
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
