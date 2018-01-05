<template>
  <div id="earth">
    <panel-title title="地磁管理"></panel-title>
    <set-location :parkingname="locParkingname" :location="geoLocation" v-if="setLocation" @getlocation="saveLocation"  @back="setLocation = false"></set-location>

    <template v-else>
      <warning-notice :ty="ty" v-if="warningNoticeShow" @back="back"></warning-notice>
      <search placeholder="请输入关键标签" @search="searchKeyword" v-show="!warningNoticeShow"></search>
      <div class="earth_container" v-show="!warningNoticeShow">
        <el-row :gutter="30">
          <el-col :span="6">
            <div class="earth_query">
              <div class="form_group">
                <p>地磁状态</p>
                <div class="block">
                  <el-select v-model="earthQuery.earthState" placeholder="请选择状态">
                    <el-option
                       v-for="item in earthQuery.earthStateOptions"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
                     </el-option>
                  </el-select>
                </div>
              </div>

              <div class="form_group">
                <p>是否空闲</p>
                <div class="block">
                  <el-select v-model="earthQuery.free" placeholder="请选择状态">
                    <el-option
                       v-for="item in earthQuery.free_options"
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
                  <el-select v-model="earthQuery.parking" placeholder="请选择停车场">
                    <el-option
                       v-for="item in earthQuery.parking_options"
                       :key="item.pid"
                       :label="item.name"
                       :value="item.pid">
                     </el-option>
                  </el-select>
                </div>
              </div>

              <div class="form_group query">
                <el-button type="primary" :loading="requestEarthLoading" @click="requestEarthQuery">查询</el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="18">
            <div class="table">

              <!-- 地磁管理操作 -->
              <!-- 地磁列表 -->
              <earth-table   v-on:warning="warningMessage" @page="page" :pageMax="pageMax" :earthMagneticData="earthMagneticData" v-loading="earthMagneticLoading" @setlocation="setlocation" @requestAgain="getEarthMagneticData"></earth-table>

              <!-- 告警列表 -->
              <!-- <warning  v-else :warningData="warningData"  v-loading="warningDataLoading"></warning> -->
            </div>
          </el-col>
        </el-row>
      </div>
      </template>
    </div>


</template>
<script type="text/javascript">
var base64 = require('base-64')
import search from '@/components/search'
import earthTable from '@/components/earthManagement/earth-table'
import warningNotice from '@/components/common/warning'
import panelTitle from '@/components/panel_title';
import setLocation from '@/components/baseSetting/setLocationParking'
const cityOptions = ['上海', '北京', '广州', '深圳'];
export default {
    name: 'earthMagnetic',
    data() {
      return {
        admin_id: "",
        warningDataLoading: false,
        earthMagneticLoading: false,
        pay_record_show: true,
        warning: false,
        deleteCheckebox: false,
        iconDelete: false,
        earthQuery: {
          earthState: '',
          earthStateOptions: [
            { label: '初始化', value: '0' },
            { label: '空闲', value: '1' },
            { label: '占用', value: '2' },
            { label: '错误', value: '3' },
            { label: '未知', value: '4' },
            { label: '离线', value: '5' }
          ],
          free: '',
          free_options: [
            { label: '所有', value: '' },
            { label: '空闲', value: '0' },
            { label: '占用', value: '1' },
          ],
          parking: '',
          parking_options: [],

        },
        warningData: [],
        earthMagneticData: [],
        tags: '',
        requestEarthLoading: false,
        selectedParkingRow: [],
        warningNoticeShow: false,
        ty: 1,
        pageMax: false,

        setLocation: false,
        locParkingname: '',
        geoLocation: {}
      }

    },
    components: {
      search,
      earthTable,
      warningNotice,
      panelTitle,
      setLocation
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;

      var _data = {
        "GeoStatus": "",
        "idle": "",
        "parkinglot":this.$route.query.parkinglot_id
      }
      var data = base64.encode(JSON.stringify(_data))

      this.earthQuery.parking = this.$route.query.parkinglot_id;
      this.getEarthMagneticData(undefined, data, 1)
      this.getParkingspaceList()
    },
    methods: {
      setlocation( obj ){
        this.setLocation = true
        this.loid = obj.did;
        this.locParkingname = obj.parkinglotName;
        this.geoLocation = {
          x: obj.coordinateX,
          y: obj.coordinateY
        }
      },

      searchKeyword( labelName ){
        this.keyword = labelName;
        this.getEarthMagneticData(labelName)
      },

      saveLocation(location){
        this.setLocation = false;
        var data = {
          "coordinateX": location.lng,
          "coordinateY": location.lat,
          "location":encodeURI(location.address)
        }

        data = base64.encode(JSON.stringify(data));

        const that = this;
        that.$jquery.post(that.$request, {
          action: 'geomagnetism_coor_edit',
          admin_id: that.admin_id,
          did: that.loid,
          data: data
        }, res => {
          if(res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '修改成功'
            })
            this.getEarthMagneticData();
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }, 'json')
      },

      deleteCheckeboxs(){
        this.cities.length = 0;
      },
      back(){
        this.warningNoticeShow = false;
      },
      warningMessage(data, page){
        this.warningNoticeShow = true
        this.ty = 1;
      },

      page( page ){
        this.getEarthMagneticData('','',page)
      },
      //获取地磁列表
      getEarthMagneticData(labelName, data, page){
        const that = this;
        this.earthMagneticLoading = true;
        this.$jquery.post(that.$request, {
          action: 'geomagnetism_list',
          admin_id: that.admin_id,
          label_name: labelName,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.earthMagneticData = res.data;
          } else {
            that.$message({ type: 'error', message: res.msg })
          }
          that.earthMagneticLoading = this.requestEarthLoading = false;
          that.pageMax = res.data.length > 0 ? false : true;
        }, 'json')
      },

      //按条件查询
      requestEarthQuery(){
        const that = this;
        this.requestEarthLoading = true;
        var requestParams = {
          GeoStatus: that.earthQuery.earthState,
          idle: that.earthQuery.free,
          parkinglot: that.earthQuery.parking
        }
        requestParams = base64.encode(JSON.stringify(requestParams));
        this.getEarthMagneticData(this.keyword, requestParams, 1)
      },

      //获取停车场列表
      getParkingspaceList(){
        const that = this;
        this.$jquery.get(that.$request, {
          action: 'parkinglot_admin_all',
          admin_id: that.admin_id
        }, res => {
          that.earthQuery.parking_options = res.data;
        }, 'json')
      },

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
    width: 100%;
    display: block;
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
        padding-top: 170px;
        button,input{
          width: 100%;
        }
      }
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
