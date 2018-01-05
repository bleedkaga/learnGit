<template>
  <div class="warning">
    <div class="operation">
      <span slot-scope="scope" >
        <el-button size="small" @click="exportEarthList" :disabled="selectedParkingRow.length == 0" type="primary">导出列表</el-button>
      </span>

      <span class="f_right">
        <el-button-group>
          <el-button size="small" icon="arrow-left"></el-button>
          <el-button size="small" icon="arrow-right"></el-button>
        </el-button-group>
      </span>
    </div>
    <el-table
      ref="multipleTable"
      :data="warningData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        @select="handleSelectionChange"
        width="55">
      </el-table-column>
      <el-table-column
        prop="parkingNo"
        label="车位编号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="deviceName"
        label="设备名称"
        width="120">
      </el-table-column>
      <el-table-column
        prop="serialNumber"
        label="设备串号"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="content"
        label="故障信息"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        label="故障代码"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span>暂无</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="alarmTime"
        label="报警时间"
        width="200"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="status"
        label="是否处理"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="handler"
        label="处理人"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="position"
        label="操作"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="primary" size="small">故障处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  var base64 = require('base-64');

  export default {
    name: 'warning',
    data(){
      return {
        selectedParkingRow: [],
        admin_id: ""
      }
    },
    props: ['warningData'],
    methods: {

      //列表选中
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.alid) )
        })
      },

      exportEarthList(){
        const that = this;
        var exportParams =  base64.encode(JSON.stringify( this.selectedParkingRow ))
        console.log( this.admin_id)
        this.$jquery.post(that.$request, {
          action : 'alarm_message_exp',
          admin_id: that.admin_id,
          alid:exportParams
        }, res => {
          window.location.href = that.$request + '?action=alarm_message_exp&admin_id='+that.admin_id+'&alid='+exportParams;
        })
      }
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      console.log( this.admin_id)
    }
  }
</script>
<style type="text/css" lang="scss">
.operation{
  margin-bottom: 20px;
}
</style>
