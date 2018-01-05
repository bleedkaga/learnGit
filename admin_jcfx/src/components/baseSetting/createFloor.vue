<template>
  <div class="floor-jc">
    <el-dialog
      title="添加楼层"
      :visible.sync="areaEditVisible"
      size="tiny">
      <div class="form_group">
        <!-- <p>pid {{pid}}</p> -->
        <p>楼层名称</p>
        <el-input placeholder="请输入楼层名称" v-model="floorName"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleAreaEditRequest" >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data(){
      return {
        areaEditVisible: true,
        floorName: '', //楼层名称
      }
    },
    props: ['pid'],
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
    },
    methods: {
      cancel(){
        this.$emit('cancel')
      },
      handleAreaEditRequest(){
        const that = this;

        if(this.floorName == ''){
          this.$message({type: 'warning', message: '请输入楼层名称'})
          return
        }
        this.$jquery.post(that.$request, {
          action: 'parkinglot_floor_add',
          admin_id: that.admin_id,
          pid: that.pid,
          name: that.floorName
        }, res => {
          if(res.error_code == '0'){
            that.$message({type: 'success', message: res.msg})
            that.$emit("cancel")
          } else {
            that.$message({type: 'error', message: res.msg})
          }
        }, 'json')
      }
    }
  }
</script>
