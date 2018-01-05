<template>
  <div class="base_table">
    <div v-if="baseSettingVisible">
      <search @search="search_val" placeholder="停车场名称" ></search>
      <el-row :gutter="20" >
          <el-col :span="24">
            <div class="panel_recharge_item activity_table_list">
              <div class="operation">
                <el-button @click="createParkingSpace" size="small"><i class="el-icon-plus"></i> 创建停车场</el-button>

                <span class="f_right">
                  <el-button-group>
                    <el-button size="small" @click="turnPage('left')" :disabled="page == 1"><i class="el-icon-arrow-left"></i></el-button>
                    <el-button size="small" @click="turnPage('right')" :disabled="pageMax"><i class="el-icon-arrow-right"></i></el-button>
                  </el-button-group>
                </span>
              </div>  <!--opration end-->

              <div class="activity_table" >
                <el-table
                  ref="multipleTable"
                  :data="baseSettingTable"
                  v-loading="tableLoading"
                  tooltip-effect="dark"
                  style="width: 100%">

                  <el-table-column
                    prop="name"
                    label="停车场"
                    align="center">
                  </el-table-column>
<!--
                  <el-table-column
                    prop="startTime"
                    label="停车场总车位"
                    align="center"
                    width="120">
                  </el-table-column> -->

                  <el-table-column
                    prop="freeTime"
                    label="免费停车时长（分）"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="OutTime"
                    label="免费出场时间"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="isrese"
                    label="是否可预约"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <span v-if="scope.row.isrese == 0">否</span>
                      <span v-else>是</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    prop="rule"
                    label="收费规则名称"
                    align="center"
                    show-overflow-tooltip>
                  </el-table-column>

                  <el-table-column
                    prop="pid"
                    label="设置"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                      <a @click="setting(scope.row)" class="setting">设置</a>
                    </template>
                  </el-table-column>

                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

    <create-parking @created="reloadParkingList" v-if="create_activity_dialog == true" @back="back" :isPartition="isPartition" :parkingid="parkingid"></create-parking >
    <editor-parking @edited="reloadParkingList" v-if="editor_activity_dialog == true" @back="editorBack" :parkingdata="parkingData"></editor-parking >
  </div>
</template>
<script>
  import search from '@/components/search';
  import createParking from '@/components/baseSetting/createParkings';
  import editorParking from '@/components/baseSetting/editorParkings';
  export default {
    name: 'base_table',
    data(){
      return {
        parkingid: '',
        baseSettingTable: [],
        val: "",
        tableLoading: false,
        page: 1,
        pageMax: false,
        isPartition: false,
        baseSettingVisible: true,
        create_activity_dialog: false,
        editor_activity_dialog: false,
        parkingdata: undefined
      }
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getBaseTableData()
    },
    methods: {
      //保存完成后重新加载停车场列表
      reloadParkingList(){
        this.getBaseTableData()
        this.baseSettingVisible = true;
        this.create_activity_dialog = false;
        this.editor_activity_dialog = false;
      },
      createParkingSpace(){
        this.baseSettingVisible = false;
        this.create_activity_dialog = true;
        this.parkingid = ''
        this.isPartition = false;
      },
      search_val( val ){
        this.val = val;
        this.page = 1;
        this.getBaseTableData()
      },

      handleSelectionChange(){

      },
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }

        this.page = page;
        this.getBaseTableData()

      },

      //获取列表信息
      getBaseTableData(){
        const that = this;

        this.tableLoading = true;
        this.$jquery.post(that.$request, {
          action: 'parkinglot_info_list',
          admin_id: that.admin_id,
          name: that.val,
          page: that.page
        }, res => {
          if(res.error_code == '0'){
            that.baseSettingTable = res.data;
            this.tableLoading = false;
          } else {
            this.$message({type: 'error', message: res.msg})
          }

          this.pageMax = res.data.length > 0 ? false : true;

        }, 'json')
      },
      back(){
        this.create_activity_dialog = false;
        this.baseSettingVisible = true;
      },

      editorBack(){
        this.baseSettingVisible = true;
        this.editor_activity_dialog = false
      },

      setting( obj ){
        this.baseSettingVisible = false;
        this.editor_activity_dialog = true;
        this.parkingData = obj;
        this.isPartition = true;
      }
    },
    components: {
      search,
      createParking,
      editorParking
    }
  }
</script>
<style type="text/css" lang="scss">

  .base_table{
    overflow: hidden;
    margin-top: -20px;
    .setting{
      text-decoration: none;
      color:#ef8d24;
    }
  }
  .parking_space_number{
    position: relative;
  }
  .page-nation{
    border-top: 1px solid #ddd;
    padding: 5px 0;
    text-align: right;
    width: 97%;
    background: white;
    position: absolute;
    z-index: 9;
    bottom:0;
    padding-right: 3%;
  }
  .no-data{
    text-align: center;
    line-height: 100px;
  }
</style>
