<template>
  <div class="create-parkinglock-password">
    <div class="operation">
      <span slot-scope="scope" >
        <el-button size="small" :disabled="settingPasswordDisabled" type="primary" @click="handlerSettingPassword">设置密码</el-button>
      </span>

      <span class="f_right">
        <el-button-group>
          <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
          <el-button size="small" icon="arrow-right" :disabled="data.length == 0" @click="turnPage('right')"></el-button>
        </el-button-group>
      </span>
    </div>

    <el-table ref="multipleTable2" :data="data" tooltip-effect="dark" style="width: 100%" align="center" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column prop="serialNumber" label="车锁串号" align="center"></el-table-column>
      <el-table-column prop="parkingNo" label="车位编号" align="center">  </el-table-column>
      <el-table-column prop="power" label="车锁电量" align="center"> </el-table-column>
      <el-table-column prop="status" label="车锁状态" align="center" show-overflow-tooltip>
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
    </el-table>




  </div>
</template>

<script>
  export default {
    name: 'parkinglockPasswordNot',
    props: ['data'],
    data(){
      return {
        page: 1,
        pageMax: false,
        parkingLocksData: [],
        selectedParkingRow: [],

        dialogFormVisible: false,

        form: {
          password: ''
        }
      }
    },
    mounted(){
       this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
    },
    computed: {
      settingPasswordDisabled: function(){
        return this.selectedParkingRow.length == 0
      }
    },
    methods: {
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.$emit("turnpage", {isPassword: 0, page: page})
        this.page = page;
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

      handlerSettingPassword(){
        const that = this;

        var par = {
          "admin_id":that.admin_id,
          "loid": that.selectedParkingRow
        }
        that.$jquery.post(that.$request + '?action=parking_lockpass_set', JSON.stringify(par), res => {
          if( res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})
          }

          that.$emit("setcomplete")
        }, 'json')
      }
    }
  }
</script>
