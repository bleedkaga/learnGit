<template>
  <div id="earth">
    <panel-title title="广告屏"></panel-title>

    <search placeholder="广告屏序列号/车位号" @search="searchKeyword"></search>

      <div class="earth_container" >
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

              <div class="form_group">
                <p>广告屏状态</p>
                <div class="block">
                  <el-select v-model="parkingLocks.bannerStatus" placeholder="请选择状态">
                    <el-option
                       v-for="item in parkingLocks.bannerStatus_options"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
                     </el-option>
                  </el-select>
                </div>
              </div>

              <div class="form_group query">
                <el-button type="primary"  @click="requestQuery">查询</el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="18">
            <div class="table">
              <div class="operation">

                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                    <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
                  </el-button-group>
                </span>
              </div>

              <el-table
                ref="multipleTable"
                :data="bannerData"
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
                  prop="serial_number"
                  label="广告屏序列号"
                  align="center">

                </el-table-column>
                <el-table-column
                  prop="parkingNo"
                  label="车位号"
                  width="120"
                  align="center">
                </el-table-column>
                <el-table-column
                  prop="floorName"
                  label="楼层名"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="parkinglotName"
                  align="center"
                  label="所属停车场"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="updateTime"
                  align="center"
                  label="上报时间"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>

     </div>
</template>
<script type="text/javascript">
import panelTitle from '@/components/panel_title';
import search from '@/components/search';
var base64 = require('base-64')

export default {
    name: 'bannerManagement',
    data() {
      return {
        bannerData: [],
        tableLoading: false,
        page: 1,
        pageMax: false,
        keyword: '',
        parkingLocks: {
          parking_options: [],
          parking: '',
          bannerStatus:'',
          bannerStatus_options: [
            { label: '离线', value: '0'},
            { label: '在线', value: '1'}
          ]
        }
      }
    },
    components: {
      panelTitle,
      search
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getBannerList(1)
      this.getParkingLotList()
    },
    methods: {
      getParkingLotList(){
        const that = this;
        this.$jquery.get(that.$request + '?action=parkinglot_admin_all&admin_id='+that.admin_id, res => {
          if(res.error_code == '0'){
            that.parkingLocks.parking_options = res.data
          } else {
            that.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },
      handleSelectionChange(){},
      turnPage( direction ){
        var that = this;
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }

        var data = {
          key: that.keyword,
          parkinglotId: that.parkingLocks.parking,
          status: that.parkingLocks.bannerStatus
        }

        this.getBannerList(page, data)
        this.page = page;
      },

      getBannerList( page, data){
        const that = this;

        this.tableLoading = true;

        var params = {
          admin_id: that.admin_id,
          page: page,
          data: data
        }
        this.$jquery.post(that.$request + '?action=adscreen_list', JSON.stringify(params), res => {
          that.tableLoading = false;

          if( res.error_code == '0'){
            that.bannerData = res.data;
          } else {
            that.$message({type: 'error', message: res.msg})
            that.bannerData = []
          }

          that.pageMax = res.data.length > 0 ? false : true;
        }, 'json')
      },

      requestQuery(){
        const that = this;
        var data = {
          key: that.keyword,
          parkinglotId: that.parkingLocks.parking,
          status: that.parkingLocks.bannerStatus
        }

        this.getBannerList(1, data)

      },
      searchKeyword( keyword ){
        this.keyword = keyword;
        var data = {
          key: keyword,
          parkinglotId: '',
          status: ''
        }

        this.getBannerList(1, data)
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
        margin-bottom: 10px;
        p{
          margin-bottom: 5px;
        }
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
