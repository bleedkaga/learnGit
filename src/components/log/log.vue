<template>
  <div id="earth">
    <panel-title title="操作日志"></panel-title>

    <div class="earth_container">
      <el-row :gutter="30">
        <el-col :span="6">
          <div class="earth_query">
            <!-- <div class="form_group">
              <p><span style="font-size: 14px; vertical-align: middle">{{today}}</span> <i class="f_right"><el-button type="primary" size="small" @click="getToday">当天</el-button></i></p>
            </div> -->


            <div class="form_group">
              <p>起止日期</p>
              <div class="block">
                <el-date-picker
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  v-model="request.startTime"
                  placeholder="选择日期时间">
                </el-date-picker>
                <el-date-picker
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  v-model="request.endTime"
                  placeholder="选择日期时间">
                </el-date-picker>
              </div>
            </div>

            <div class="form_group">
              <p>停车场</p>
              <div class="block">
                <el-select v-model="request.parking">
                  <el-option v-for="item in request.parking_options"
                              :key="item.pid"
                              :label="item.name"
                              :value="item.pid"></el-option>

                </el-select>
              </div>
            </div>

            <div class="form_group">
              <p>日志类型</p>
              <div class="block">
                <el-select v-model="request.log">
                  <el-option v-for="item in request.log_options"
                              :key="item.menuNo"
                              :label="item.menuName"
                              :value="item.menuNo"></el-option>

                </el-select>
              </div>
            </div>

            <div class="form_group query">
              <el-button type="primary" :loading="queryLoading"  @click="query">查询</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="table">
            <div class="operation">
              <span slot-scope="scope" >
                <el-button size="small" type="primary" :disabled="selectedParkingRow.length == 0" @click="exportLog">导出列表</el-button>
              </span>

              <span class="f_right">
                <el-button-group>
                  <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
                  <el-button size="small" icon="arrow-right":disabled="pageMax"   @click="turnPage('right')"></el-button>
                </el-button-group>
              </span>
            </div>

            <el-table
              ref="multipleTable"
              :data="logTable"
              tooltip-effect="dark"
              v-loading="tableLoading"
              style="width: 100%"
              @selection-change="getSectionRow">
              <el-table-column
                type="selection"
                @select="getSectionRow"
                width="55">
              </el-table-column>
              <el-table-column
                prop="parkingLot"
                label="停车场"
                width="120">
              </el-table-column>
              <el-table-column
                prop="menuName"
                label="日志类型"
                width="120">
              </el-table-column>
              <el-table-column
                prop="operator"
                width="140"
                label="操作账号"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="operateTime"
                width="140"
                label="操作时间"
                show-overflow-tooltip>
              </el-table-column>
              <el-table-column
                prop="content"
                label="日志内容"
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
import { formatDate } from '@/common/date.js'
import search from '@/components/search'
import panelTitle from '@/components/panel_title'

const base64 = require('base-64');
export default {
    name: 'log',
    data() {
      return {
        today: '',
        request: {
          parking: '',
          parking_options: [],
          log: '',
          log_options: [],
          startTime: '',
          endTime: ''
        },
        logTable: [],
        queryLoading: false,
        page: 1,
        pageMax: false,
        tableLoading: true,
        selectedParkingRow: []
      }
    },
    created () {

    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getParkingList();
      this.getLogTypeList();
      this.getLogTableList();
      this.getToday()
    },
    methods: {
      query(){
        const _this = this;
        const that = this.request;
        var start = that.startTime ? formatDate( that.startTime, "yyyy-MM-dd hh:mm") : '',
            end = that.endTime ? formatDate(that.endTime ,"yyyy-MM-dd hh:mm") : '';
        if(start > end ){
          this.$message({type: 'warning', message: _this.tips.TIME_ERROR})
          throw that.tips.TIME_ERROR
        }
        var params = {
            "start": start,
            "end": end,
            "pid": that.parking,
            "menuNo": that.log
        }

        params = base64.encode(JSON.stringify( params ))
        this.queryLoading = true;
        this.getLogTableList(params)
      },
      getParkingList(){
       const that = this;
        this.$jquery.get(that.$request, {
          action: 'parkinglot_admin_all',
          admin_id: that.admin_id
        }, res => {
          that.request.parking_options = res.data;
        }, 'json')
      },
      getLogTypeList(){
        const that = this;
        this.$jquery.post(this.$request, {
          action: 'operating_menu',
          admin_id: that.admin_id
        }, res => {
          if( res.error_code == '0'){
            that.request.log_options = res.menu;
          } else {
            that.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      },
      getLogTableList(data, page){
        const that = this;

        this.tableLoading = true;
        that.$jquery.post(that.$request, {
          action: 'operating_list',
          admin_id: that.admin_id,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.logTable = res.data;
          }else {
            that.logTable = []
            that.$message({type: 'error', message: res.msg})
          }
          that.pageMax = res.data ? false : true;
          that.tableLoading = that.queryLoading =  false;
        }, 'json')
      },

      //获取当天
      getToday(){
        var date = new Date();

        var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
        this.today = year + '-' + this.digits(month + 1) + '-' + this.digits(day)
      },

      turnPage( direction ){
        var page = this.page;
        const that = this.request;
        var start = that.startTime ? formatDate( that.startTime, "yyyy-MM-dd hh:mm") : '',
            end = that.endTime ? formatDate(that.endTime ,"yyyy-MM-dd hh:mm") : '';

        var params = {
            "start": start,
            "end": end,
            "pid": that.parking,
            "menuNo": that.log
        }
        params = base64.encode(JSON.stringify( params ))
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getLogTableList(params, page)
        this.page = page;
      },

      getSectionRow(index){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.logid) )
        })
      },
      digits( s ){
        return s < 10 ? '0'+s : s
      },
      //导出日志
      exportLog(){
        const that = this;
        var logids = base64.encode( JSON.stringify(this.selectedParkingRow));
        this.$jquery.post(that.$request, {
          action: 'operating_exp',
          admin_id: that.admin_id,
          logid: logids
        }, res => {
          window.location.href = that.$request + '?action=operating_exp&admin_id='+that.admin_id+'&logid='+logids;
        })
      }
    },

    components: {
      panelTitle,
      search
    },
     filters: {
       formatDate(time){
         var date = new Date( time );
         return formatDate(date, "yyyy-MM-dd hh:mm");
       },

     }
  }


</script>
<style lang="scss">

#earth{
  padding: 0 20px;
  .earth_container{
    margin-top: 30px;
    .el-date-editor--datetime{
      width: 100%;
      margin-bottom: 10px;
    }
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
      p{
        margin:0;
        margin-bottom: 10px;
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
    margin-right: 0px;
  }
}

.f_right{
  float: right;
  font-style: normal;
}

</style>
