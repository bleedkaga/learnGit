<template>
  <div class="warning">
    <div class="panel_search" id="search">
      <el-row>
        <el-col :span="6">
          <div class="span_group" @click="back">
            <i class="el-icon-arrow-left"></i> 告警消息
          </div>
        </el-col>
        <!-- <el-col :span="18">
          <el-input placeholder="请输入关键标签" v-model="importantKey">
            <el-button slot="append" icon="search" @click="searchKey"></el-button>
          </el-input>
        </el-col> -->
      </el-row>
    </div>
    <el-row :gutter="30">
      <el-col :span="6" >
        <div class="left">
          <div class="form_group">
            <p>所属停车场</p>
            <el-select v-model="parking">
              <el-option v-for="item in parkings_options" :label="item.name" :value="item.pid" :key="item.pid"></el-option>
            </el-select>
          </div>
          <div class="form_group">
            <p>故障分类</p>
            <el-select v-model="type">
              <el-option v-for="item in type_options" :label="item.label" :value="item.value" :key="item.key"></el-option>
            </el-select>
          </div>
          <div class="form_group">
            <p>是否处理</p>
            <el-select v-model="chuli">
              <el-option v-for="item in chuli_options" :label="item.label" :value="item.value" :key="item.key"></el-option>
            </el-select>
          </div>
          <div class="form_group">
            <p>起止日期</p>
            <el-date-picker
              v-model="start"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              placeholder="选择日期时间">
            </el-date-picker>
            <el-date-picker
              v-model="end"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              placeholder="选择日期时间">
            </el-date-picker>
          </div>
          <div class="form_group">
            <el-button type="primary" @click="query" :loading="queryLoading"> 查 询</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="right">
          <el-button type="primary"  size="small" :disabled="selectedParkingRow.length == 0" @click="exportWarningList">导出列表</el-button>
          <span class="f_right">
            <el-button-group>
              <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
              <el-button size="small" icon="arrow-right":disabled="pageMax"   @click="turnPage('right')"></el-button>
            </el-button-group>
          </span>
          <el-table
            :data="tableData"
            v-loading="tableLoading"
            @selection-change="handleSelectionChange"
            style="width: 100%">
            <el-table-column
              type="selection"
              @select="handleSelectionChange"
              align="center">
            </el-table-column>
            <el-table-column
              prop="parkingNo"
              width="70"
              label="车位编号">
            </el-table-column>
            <el-table-column
              prop="deviceName"
              width="70"
              label="设备名称">
            </el-table-column>
            <el-table-column
              prop="serialNumber"
              label="设备串号">
            </el-table-column>
            <el-table-column
              prop="content"
              label="故障信息">
            </el-table-column>
            <!-- <el-table-column
              prop="address"
              label="故障代码">
            </el-table-column> -->
            <el-table-column
              prop="alarmTime"
              show-overflow-tooltip
              label="报警时间">
            </el-table-column>
            <el-table-column
              prop="status"
              label="是否处理">
              <template slot-scope="scope">
                <span v-if="scope.row.status == 0">未处理</span>
                <span v-else>已处理</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="handler"
              label="处理人">
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作">
              <template slot-scope="scope">
                <el-button v-if="scope.row.status == 0" type="primary" size="small" @click="faulthandling(scope.row)">故障处理</el-button>
                <span v-else>已处理</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { formatDate } from '@/common/date.js';
var base64 = require('base-64');
export default {
  name: 'warning',
  props: ['ty'],
  data(){
    return {
      admin_id: '',
      start: '',
      end: '',
      tableData: [],
      tableLoading: false,
      page: 1,
      pageMax : false,
      importantKey: '',
      parking: '',
      type: '',
      chuli: '',
      type_options: [
        { label: '全部', value: ''},
        { label: '低电量', value: '0'},
        { label: '强磁干扰', value: '1'},
        { label: '离线', value: '2'},
      ],
      chuli_options: [
        { label: '全部', value: ''},
        { label: '未处理', value: '0'},
        { label: '已处理', value: '1'}
      ],
      parkings_options: [],
      selectedParkingRow: [],
      queryLoading: false,
    }
  },
  mounted(){
    this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    this.getWarningTable()
    this.getParkingsList()
  },
  filters: {
   formatDate(time){
      var date = new Date( time );
      return formatDate(date, "yyyy-MM-dd hh:mm");
    }
  },
  methods: {
    back(){
      this.$emit('back')
    },

    faulthandling( obj ){
      const that = this;
      this.$confirm('是否完成此设备的故障处理，将其标注为已处理？', '故障处理', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        that.$jquery.post(that.$request, {
          action: 'alarm_message_status',
          admin_id: that.admin_id,
          type: that.$props.ty,
          alid: obj.alid
        }, res => {
          if( res.error_code == '0'){
            this.$message({
              type: 'info',
              message: '操作成功'
            });

            var start = that.start ? formatDate( that.start, "yyyy-MM-dd hh:mm") : "",
                end = that.end ?  formatDate( that.end, "yyyy-MM-dd hh:mm"): "";
            var params  = {
                "start": start,
                "end": end,
                "type": that.type,
                "status": that.chuli,
                "parkinglot": that.parking
            }

            params = base64.encode(JSON.stringify(params));
            this.getWarningTable(params, this.page)

          } else {
            this.$message({
              type: 'info',
              message: res.msg
            });
          }
        }, 'json')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '您取消了本次故障处理！'
        });
      });
    },

    query(){
      const that = this;

      var start = that.start ? formatDate( that.start, "yyyy-MM-dd hh:mm") : "",
          end = that.end ?  formatDate( that.end, "yyyy-MM-dd hh:mm"): "";
      if(start > end){
        this.$message({type: 'warning', message: that.tips.TIME_ERROR})
        throw that.tips.TIME_ERROR
      }
      var params  = {
          "start": start,
          "end": end,
          "type": that.type,
          "status": that.chuli,
          "parkinglot": that.parking
      }

      params = base64.encode(JSON.stringify(params));
      this.getWarningTable(params, 1)
      this.page = 1;
    },
    getParkingsList(){
      const that = this;
      this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, function ( res ) {
        that.parkings_options = res.data;
      }, 'json')
    },
    getWarningTable( data, page){
      const that = this;
      console.log(that.ty)
      this.tableLoading = true;
      this.$jquery.post(that.$request, {
        action:'alarm_message',
        admin_id: that.admin_id,
        ty: that.$props.ty,
        data: data,
        page: page
      }, res => {
        if(res.error_code == '0'){
          that.tableData = res.data;
        } else {
          that.tableData = []
          that.$message({ type :'error', message: res.msg})
        }
        that.tableLoading = that.queryLoading= false;
        that.pageMax = res.data ? false : true;

      }, 'json')
    },
    searchKey(){
      const that = this;
    },
    turnPage( direction ){
      let that = this;
      var page = this.page;
      if( direction == 'left'){
        page--
      } else {
        page++
      }

      var start = that.start ? formatDate( that.start, "yyyy-MM-dd hh:mm") : "",
          end = that.end ?  formatDate( that.end, "yyyy-MM-dd hh:mm"): "";
      var params  = {
          "start": start,
          "end": end,
          "type": that.type,
          "status": that.chuli,
          "parkinglot": that.parking
      }

      params = base64.encode(JSON.stringify(params));
      this.getWarningTable(params, page)
      this.page = page;
    },

    handleSelectionChange( index ){
      this.selectedParkingRow = []
      var arr = this.selectedParkingRow;
      index.forEach( i => {
         arr.push( parseFloat(i.alid) )
      })
    },
    exportWarningList(){
      const that = this;
      var alid = base64.encode(JSON.stringify(that.selectedParkingRow));
      this.$jquery.post(that.$request, {
        action: 'alarm_message_exp',
        admin_id: that.admin_id,
        alid: alid
      }, res => {
        window.location.href = that.$request+ '?action=alarm_message_exp&admin_id='+that.admin_id+'&alid='+alid;
      })
    }
  }
}
</script>
<style type="text/css"  lang="scss" scoped>
  .warning{
    margin-top: 30px;
    .panel_search{
      margin-bottom: 30px;
    }
    .span_group{
      vertical-align: middle;
      height: 36px;
      line-height: 36px;
      cursor: pointer;
    }
    .left{
      background: white;
      overflow: hidden;
      padding: 20px;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
      .el-select, .el-date-editor.el-input{
        width: 100%;
      }
      .el-date-editor.el-input{
        margin-bottom: 10px;
      }
      .el-button{
        margin-top: 100px;
        width: 100%;
      }
    }
    .right{
      padding: 20px;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
      background: white;
      .el-button{
        margin-bottom: 20px;
      }
      .cell .el-button{
        margin-bottom: 0
      }
    }
  }
</style>
