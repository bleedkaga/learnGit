<template>
  <div class="admin_list">
    <div class="location-search">
      <el-row :gutter="10">
        <el-col :span="6">
          <div class="setting" @click="back"><span  style="line-height:36px;"><i class="el-icon-arrow-left"></i>分配管理员</span></div>
        </el-col>
        <el-col  :span="18">
          <el-input placeholder="搜索" v-model="input">
            <el-button slot="append" icon="search" @click="searchAdminListName"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <div class="admin_table">
      <span class="f_right">
        <el-button-group>
          <el-button size="small" @click="turnPage('left')" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
          <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
        </el-button-group>
      </span>
      <el-table :data="adminListTable" ref="multipleTable" v-loading="adminListTableLoading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" @select="handleSelectionChange" ></el-table-column>
        <el-table-column label="管理员名称" prop="name" width="150"></el-table-column>
        <el-table-column label="所属角色" prop="roleName" width="150"></el-table-column>
        <el-table-column label="角色权限" prop="privilege"></el-table-column>
      </el-table>
      <div class="addAdmin">
        <el-button @click="cancel">取消</el-button>
        <el-button  type="primary" @click="addAdmin" :disabled="selectedParkingRow.length == 0">添加</el-button>
      </div>
    </div>
  </div>
</template>
<script type="text/javascript">
  var base64 = require("base-64")
  export default {
    name: 'adminList',
    props: ['cid','adminid'],
    data(){
      return {
        input: "",
        adminListTableLoading: false,
        adminListTable: [],
        page: 1,
        pageMax: false,
        selectedParkingRow: []
      }
    },
    computed: {

    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getAdminList()
      this.adminids = this.adminid.split(',')
      console.log(this.adminids)
    },
    methods: {
      checkedRow(row){
         this.$refs.multipleTable.toggleRowSelection(this.adminListTable[row],true);
      },
      //车位添加管理员
      addAdmin(){
        const that = this;
        var adminid = base64.encode(JSON.stringify(that.selectedParkingRow)),
            cid = base64.encode(JSON.stringify(that.cid));

        this.$jquery.post(that.$request, {
          action: 'parking_admin_add',
          admin_id: that.admin_id,
          adminid: adminid,
          cid: cid
        }, res => {
          if(res.error_code == '0'){
            that.$message({ type: 'success', message: '操作成功'})
            this.$emit('back')
          } else {
            that.$message({ type: 'error', message: res.msg})
          }
        }, 'json')
      },

      handleSelectionChange( index ){
        this.selectedParkingRow = []
        var arr = this.selectedParkingRow;
        index.forEach( i => {
           arr.push( parseFloat(i.adminid) )
        })
      },

      //取消
      cancel(){
        this.selectedParkingRow = [];
        this.$refs.multipleTable.clearSelection();
      },

      back(){
        this.$emit('back')
      },
      searchAdminListName(){
        this.getAdminList(this.input)
      },
      getAdminList( admin_name, page ){
        const that = this;
        that.adminListTableLoading = true
        that.$jquery.post(that.$request, {
          action: 'parking_admin',
          admin_id: that.admin_id,
          page: page,
          admin_name: admin_name
        }, res => {
          if( res.error_code == '0'){
            this.adminListTable = res.data;

            //预勾选 管理员
            if(that.adminids){

              var adminid = that.adminids;
              console.log(adminid)
              that.$nextTick(function(){
                var rowIndex = [];

                // if(adminid.length == 1){
                //   that.checkedRow(1);
                // } else {
                //   for(var i = 0; i < that.adminListTable.length; i++){
                //     for(var j = 0; j < adminid.length; j++){
                //       if(that.adminListTable[i].adminid == adminid[j]){
                //         rowIndex.push(i)
                //       }
                //     }
                //   }

                //   for(var i = 0; i < rowIndex.length; i++){
                //     that.checkedRow(i);
                //   }
                // }

                for(var i = 0; i < that.adminListTable.length; i++){
                  for(var j = 0; j < adminid.length; j++){
                    if(that.adminListTable[i].adminid == adminid[j]){
                      // console.log(i)
                      rowIndex.push(i)
                    }
                  }
                }

                for(var i = 0; i < rowIndex.length; i++){
                  // console.log('checkrow', JSON.stringify(rowIndex))
                  that.checkedRow(rowIndex[i]);
                }

              });
            }

          } else {
            that.$message({ type: 'error', message: res.msg})
          }

          that.pageMax = res.data.length > 0 ? false : true;
          that.adminListTableLoading = false;
        }, 'json')
      },
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getAdminList(this.input,  page)
        this.page = page;
      },

    }
  }
</script>
<style type="text/css" lang="scss">
.admin_list{
  .location-search{
    background: white;
    padding: 20px;
    margin-top: 30px;
    border: 1px solid #bfcbd9;
    cursor: pointer;
  }
  .admin_table{
    background: white;
    border: 1px solid #bfcbd9;
    padding: 20px;
    margin-top: 30px;
    overflow: hidden;
  }
  .f_right{
    float: right;
    margin-bottom: 20px;
  }
  .addAdmin{
    margin-top: 30px;
  }
}
</style>
