<template>
  <div class="earth-table-list" id="earthTable">
    <div class="operation">
      <span slot-scope="scope" >
        <el-button size="small" @click="addLabel" :disabled="selectedParkingRow.length == 0 || selectedParkingRow.length > 1"><i class="el-icon-plus"></i> 添加标签</el-button>
        <el-button size="small" @click="tagsManagement" ><i class="iconfont icon-17"></i> 标签管理</el-button>
        <el-button size="small" @click="warningMessage">告警消息</el-button>
        <el-button size="small" @click="exportEarthList" :disabled="selectedParkingRow.length == 0" type="primary">导出列表</el-button>
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
      :data="earthMagneticData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        @select="handleSelectionChange"
        width="55">
      </el-table-column>
      <el-table-column
        prop="geoNumber"
        label="地磁串号"
        align="center"
        width="120">
      </el-table-column>
      <el-table-column
        prop="parkingNo"
        label="车位编号"
        align="center"
        width="120">
      </el-table-column>

      <el-table-column
        prop="geo_power"
        label="地磁电量"
        width="120">
      </el-table-column>
      <el-table-column
        prop="idle"
        label="是否空闲"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.idle == 0">空闲</span>
          <span v-else>占用</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="geo_state"
        label="地磁状态"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.geo_state == 0">初始化</span>
          <span v-else-if="scope.row.geo_state == 1">空闲</span>
          <span v-else-if="scope.row.geo_state == 2">占用</span>
          <span v-else-if="scope.row.geo_state == 3">错误</span>
          <span v-else-if="scope.row.geo_state == 4">未知</span>
          <span v-else-if="scope.row.geo_state == 5">离线</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="statusTime"
        label="状态更新时间"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="parkinglotName"
        label="所属停车场"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="label"
        label="标签"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <!-- <span class="pointer" @click="editLabel(scope.row)">{{scope.row.label}}</span> -->
          <span class="pointer" >{{scope.row.label}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="location"
        label="地磁位置"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="pointer" v-if="scope.row.location !== '' "  @click="viewLocation(scope.row)">{{scope.row.location}}</span>
          <span class="pointer" v-else  @click="viewLocation(scope.row)">设 置</span>
        </template>
      </el-table-column>
    </el-table>

    <label-management :ty="1" :did="did" :selectedLabel="selectedLabel" v-if="label" @cancel="cancel" @done="requestAgainList" :isManagement="isManagement"></label-management>
  </div>
</template>
<script>
  var base64 = require('base-64')
  import labelManagement from '@/components/common/earth-label'
  export default {
    name: 'earthTable',
    props: ['earthMagneticData', 'pageMax'],
    data(){
      return {
        selectedParkingRow: [],
        page: 1,
        label: false,
        did: null,
        isManagement: false,
        selectedLabel: undefined
      }
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;

    },
    components: {
      labelManagement
    },
    methods: {

      viewLocation( obj ){
        this.$emit('setlocation', obj)
      },
      //列表选中
      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow
        index.forEach( i => {
           arr.push( parseFloat(i.did) )
        })
        this.selectedLabel = index;
        console.log(this.selectedLabel)
      },
      requestAgainList(){
        this.$emit('requestAgain')
      },

      //导出地磁列表
      exportEarthList(){
        const that = this;
        var didStringify = base64.encode( JSON.stringify( that.selectedParkingRow ));
        this.$jquery.post(that.$request, {
          action: "geomagnetism_exp",
          admin_id: that.admin_id,
          did: didStringify
        }, res => {
          window.location.href = that.$request + '?action=geomagnetism_exp&admin_id=' + that.admin_id + '&did=' + didStringify;
        })
      },
      addLabel(){
        let did = this.selectedParkingRow
        this.did = did
        this.label = true;
        this.isManagement = false;
      },
      editLabel( obj ){
        this.isManagement = false;
        this.label = true;
        this.did = obj.did
        this.selectedLabel = obj.labelid
      },
      cancel(){
        this.label = false;
        this.requestAgainList()
        this.did = ''
      },
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.$emit('page', page)
        this.page = page;
      },

      //查看告警信息
      warningMessage(data, page){
        console.log('child response')
        this.$emit('warning')
      },

      tagsManagement(){
        this.label = true;
        this.isManagement = true;
        this.selectedLabel = [];
        this.did = ''
      },
    }
  }
</script>
<style type="text/css" lang="scss">
  .operation{
    margin-bottom: 20px;
  }
</style>
