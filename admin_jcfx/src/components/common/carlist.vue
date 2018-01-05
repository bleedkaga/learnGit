<template>
  <div class="parking_space_list">
    <el-select v-model="parking" @change="sendValue">
      <el-option v-for="item in parkings_options" :label="item.name" :key="item.pid" :value="item.pid"></el-option>
    </el-select>
  </div>
</template>
<script>
  export default {
    name: 'parkingList',
    props: ['parking'],
    data(){
      return {
        parkings_options: []
      }
    },
    mounted(){
      this.getParkingsList()
    },
    methods: {
      //获取停车场列表
      getParkingsList(){
        const that = this;
        this.$jquery.get(that.$request+'?action=parkinglot_admin_all&admin_id='+that.admin_id, function ( res ) {
          that.parkings_options = res.data;
        }, 'json')
      },

      sendValue(){
        this.$emit('change', this.parking)
      }
    }
  }
</script>
<style type="text/css" lang="scss">
  .parking_space_list .el-select{ width: 100%;}
</style>
