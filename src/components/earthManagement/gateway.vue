<template>
  <div id="earth">
    <panel-title :title="$route.meta.path_name"></panel-title>
    <set-location :parkingname="locParkingname" :location="geoLocation" v-if="setLocationVisible" @getlocation="saveLocation"  @back="setLocationVisible = false"></set-location>
    <template v-else>
      <warning-notice :ty="ty" v-if="warningNoticeShow" @back="back"></warning-notice>
      <search placeholder="请输入关键标签" v-show="!warningNoticeShow" @search="searchKeyword"></search>

      <div class="earth_container" v-show="!warningNoticeShow">
        <el-row :gutter="30">
          <el-col :span="6">
            <div class="earth_query">
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
                  <el-button size="small" @click="addLabel" :disabled="selectedParkingRow.length == 0 || selectedParkingRow.length > 1"><i class="el-icon-plus"></i> 添加标签</el-button>
                  <el-button size="small" @click="tagsManagement" ><i class="iconfont icon-17"></i> 标签管理</el-button>
                  <!-- <el-button size="small" @click="deleteGateway" :disabled="selectedParkingRow.length==0"><i class="el-icon-delete"></i> 删除网关</el-button> -->
                  <!-- <el-button size="small" @click="warningNoticeHandler">告警消息</el-button> -->
                  <el-button size="small" type="primary" @click="exportGateWayList" :disabled="selectedParkingRow.length==0">导出列表</el-button>
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
                :data="gatewayData"
                tooltip-effect="dark"
                v-loading="tableLoading"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  @select="handleSelectionChange"
                  width="55">
                </el-table-column>
                <el-table-column
                  prop="serialNumber"
                  label="网关串号"
                  align="center">

                </el-table-column>
                <el-table-column
                  prop="verno"
                  label="版本号"
                  width="120"
                  align="center">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态"
                  align="center"
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span v-if="scope.row.status == 0">在线</span>
                    <span v-else >离线</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="statusTime"
                  align="center"
                  label="状态更新时间"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="parkinglotName"
                  label="所属停车场"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="label"
                  align="center"
                  label="标签"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="location"
                  align="center"
                  label="网关位置"
                  show-overflow-tooltip>
                  <template slot-scope="scope" >
                    <span class="pointer" @click="viewLocation(scope.row)" v-if="scope.row.location !== '' ">{{scope.row.location}}</span>
                    <span class="pointer" @click="viewLocation(scope.row)" v-else>设 置</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>
    </template>

    <label-management :ty="3" :selectedLabel="selectedLabel" :gwid="gwid" v-if="label" @cancel="cancel" :isManagement="isManagement" @done="getGatewayList"></label-management>
  </div>
</template>
<script type="text/javascript">
import search from '@/components/search';
import warningNotice from '@/components/common/warning';
import labelManagement from '@/components/common/parking-gateway-label';
import panelTitle from '@/components/panel_title';
import setLocation from '@/components/baseSetting/setLocationParking';
var base64 = require('base-64')

export default {
    name: 'earthMagnetic',
    data() {
      return {
        ty: 3,
        warning: false,
        warningNoticeShow: false,
        deleteCheckebox: false,
        iconDelete: false,


        parkingLocks: {
          parking: '',
          parking_options: []
        },
        gatewayData: [],
        tags: '',
        requestLoading: false,
        tableLoading: false,
        page: 1,
        pageMax: false,
        selectedParkingRow: [],
        label: false,

        setLocationVisible: false,
        gwid: '',

        isManagement: false,
      }
    },
    components: {
      search,
      warningNotice,
      labelManagement,
      panelTitle,
      setLocation
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getParkingspaceList()
      this.getGatewayList()
      this.parkingLocks.parking = this.$route.query.parkinglot_id
    },
    methods: {
      viewLocation( obj ){
        this.setLocationVisible = true;
        this.locParkingname = obj.parkinglotName;
        this.gwid = obj.gwid;

        this.geoLocation = {
          x: obj.coordinateX,
          y: obj.coordinateY
        }

      },
       saveLocation(location){
        this.setLocationVisible = false;
        var data = {
          "coordinateX": location.lng,
          "coordinateY": location.lat,
          "location":encodeURI(location.address)
        }

        data = base64.encode(JSON.stringify(data));

        const that = this;
        that.$jquery.post(that.$request, {
          action: 'gateway_coor_edit',
          admin_id: that.admin_id,
          gwid: that.gwid,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '修改成功'
            })
            this.getGatewayList();
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      warningNoticeHandler(){
        this.ty = 3
        this.warningNoticeShow = true
      },
      addLabel(){
        this.gwid = this.selectedParkingRow
        this.isManagement = false
        this.label = true;
      },
      cancel(){
        this.label = false;
        this.gwid = ''
      },
      back(){
        this.warningNoticeShow = false
      },

      getParkingspaceList(){
        const that = this;
        this.$jquery.get(that.$request, {
          action: 'parkinglot_admin_all',
          admin_id: that.admin_id
        }, res => {
          that.parkingLocks.parking_options = res.data;
        }, 'json')
      },

      //搜索关键词
      searchKeyword( keyword ){
        this.getGatewayList( name )
      },

      getGatewayList(name, data, page){
        const that = this;
        this.tableLoading = true;
        this.$jquery.post( that.$request, {
          action: 'gateway_list',
          admin_id: that.admin_id,
          data: data,
          label_name: name,
          page: page
        }, res => {
          if( res.data.length > 0){
            that.pageMax = false
          } else {
            that.pageMax = true;
          }
          this.tableLoading = this.requestLoading = false
          that.gatewayData = res.data;
        }, 'json')
      },

      //按条件查询车位锁
      requestCondition(){
        this.requestLoading = true;
        const that = this;
        var requestParams = {
          parkinglot: that.parkingLocks.parking
        }
        requestParams = base64.encode( JSON.stringify(requestParams) )

        this.getGatewayList(null, requestParams, 1)
      },

      //翻页
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getGatewayList(null, null, page)
        this.page = page;
      },

      //表格选中
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.gwid) )
        })
        this.selectedLabel = index;
      },

      //删除网关
      deleteGateway(){
        const that = this;
        var gwids = this.$base64.encode(JSON.stringify(this.selectedParkingRow))
        this.$jquery.post( that.$request, {
          action: 'gateway_del',
          admin_id: that.admin_id,
          gwid: gwids
        }, res => {
          if( res.error_code == '0' ){
            this.$message({ type: 'success', message: '删除成功'} )
            this.getGatewayList()
          } else {
            this.$message({ type: 'error', message: res.msg})
          }
        }, 'json')
      },

      //导出网关列表
      exportGateWayList(){
        const that = this;

        var gwids = this.$base64.encode(JSON.stringify(this.selectedParkingRow))
        this.$jquery.post(that.$request, {
          action: 'gateway_exp',
          admin_id: that.admin_id,
          gwid: gwids
        }, function(res){
          window.location.href = that.$request + '?action=gateway_exp&admin_id='+that.admin_id+'&gwid='+gwids
        })
      },

      tagsManagement(){
        this.label = true;
        this.gwid = this.selectedParkingRow;
        this.isManagement = true;
        this.selectedLabel = [];
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
