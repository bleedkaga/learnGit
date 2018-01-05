<template>
  <div class="create-parkinglock-password">
    <div class="operation">
      <!-- <span slot-scope="scope" >
        <el-button size="small" :disabled="settingPasswordDisabled" type="danger" @click="">删除密码</el-button>
      </span> -->

      <span class="f_right">
        <el-button-group>
          <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
          <el-button size="small" icon="arrow-right" :disabled="data.length == 0" @click="turnPage('right')"></el-button>
        </el-button-group>
      </span>
    </div>

     <el-table ref="multipleTable" :data="data" tooltip-effect="dark" style="width: 100%" align="center" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55"> </el-table-column>
      <el-table-column prop="parkingNo" label="车位编号" align="center"> </el-table-column>
      <el-table-column prop="serialNumber" label="车锁串号" align="center"></el-table-column>
      <el-table-column prop="status" label="车锁状态" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.status == 0">未连接</span>
          <span v-else-if="scope.row.status == 1">升起</span>
          <span v-else-if="scope.row.status == 2">降下</span>
          <span v-else-if="scope.row.status == 3">外力碰撞</span>
          <span v-else-if="scope.row.status == 4">升起受阻</span>
          <span v-else-if="scope.row.status == 5">硬件故障</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>

      <el-table-column prop="power" label="车锁电量" align="center">  </el-table-column>
      <el-table-column prop="vcode" label="密码" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="密码操作"  align="center" width="150" >
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="updatePassword(scope.row.loid)">更 新</el-button>
          <el-button type="danger" size="small" @click="deletePassword(scope.row)">删 除</el-button>
        </template>
      </el-table-column>

    </el-table>



    <el-dialog title="密码设置" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="请输入密码" >
          <el-input v-model="form.password" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'parkinglockPasswordNot',
    props: ['data', 'pageMax'],
    data(){
      return {
        page: 1,
        parkingLocksData: [],
        selectedParkingRow: [],
        dialogFormVisible: false,
        form: {
          password:''
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
        console.log('page ', page)
        this.$emit("turnpage", {isPassword: 1, page: page})
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
      updatePassword( row ){
        const that = this;
        console.log(row)

        var id = []; id.push(row)
        var par = {
          "admin_id":that.admin_id,
          "loid": id
        }
        that.$jquery.post(that.$request + '?action=parking_lockpass_set', JSON.stringify(par), res => {
          if( res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})

            that.getParkingLockPassList(1, 1)
          }
        }, 'json')
      },

      getParkingLockPassList( ispaasword, page){
        const that = this;
        var params = {
          "admin_id": that.admin_id,
          "ispaasword": ispaasword,
          "page": page
        }
        this.$jquery.post(that.$request + '?action=parking_lockpass_list', JSON.stringify(params), function( res ){

          if(res.error_code == '0'){
            that.data = res.data;
          } else {
            that.$message({type: 'error', message: res.msg})
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
