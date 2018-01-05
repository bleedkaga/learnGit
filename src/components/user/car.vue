<template>
  <div class="car">
    <div class="panel">
      <el-button icon="delete" @click="deleteBindCar" :disabled="selectedParkingRow.length == 0" type="small"></el-button>
      <span class="f_right">
        <el-button-group>
          <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
          <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
        </el-button-group>
      </span>

      <el-table
        :data="userTable"
        v-loading="tableLoading"
        style="width: 100%"
        @selection-change="getSectionRow">
        <el-table-column type="selection" ></el-table-column>
        <el-table-column
          prop="carNumber"
          label="绑定车辆"
          width="330">
        </el-table-column>
        <el-table-column
          prop="parkinglotName"
          label="包期停车场">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>

  export default {
    name: 'car',
    props: ['userid'],
    data(){
      return {
        userTable: [],
        page: 1,
        pageMax: false,
        tableLoading: false,
        uid: '',
        selectedParkingRow: []
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.uid = this.$props.userid;
      this.getCarList();

    },
    methods: {
      getSectionRow(index){
        this.selectedParkingRow = [];
        index.forEach( i => {
           this.selectedParkingRow.push(i.carid)
        })
      },
      getCarList(page){
        const that = this;
        this.$jquery.post(that.$request, {
          action: 'user_carlist',
          admin_id:that.admin_id,
          userid: that.uid,
          page: page
        }, res => {
          if(res.error_code == '0'){
            this.userTable = res.data;
          }
          this.pageMax = res.data.length > 0 ? false : true;
        }, 'json')
      },
      deleteBindCar(){
        let _this = this;
        let carid = this.$base64.encode(JSON.stringify(this.selectedParkingRow));
        console.log(carid)
        _this.$jquery.post(_this.$request, {
          action: 'user_cardel',
          admin_id: _this.admin_id,
          userid: _this.uid,
          carid: carid
        }, res => {
          if(res.error_code == '0'){
            _this.$message({type: 'success', message: '删除成功'})
            _this.getCarList()
          } else {
            _this.$message({type: 'error', message: res.msg})
          }

        }, 'json')
      },
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }

        this.getCarList(page)
        this.page = page;
      },
    }

  }
</script>
<style type="text/css" lang="scss">
  .panel{
    background: white;
    border: 1px solid #ddd;
    padding: 20px;
    margin-top: 30px;
  }

</style>
