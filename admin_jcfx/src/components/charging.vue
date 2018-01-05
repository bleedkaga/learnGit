<template>
  <div id="charging">
    <panel-title title="收费规则设置"></panel-title>

    <div class="charging_table">
      <div class="top">
        <el-button-group>
          <el-button size="small" icon="plus" @click="addRulesVisibleHandler"></el-button>
          <el-button size="small" icon="delete" :disabled="selectedParkingRow.length == 0" @click="deleteChargingRules"></el-button>
        </el-button-group>

        <el-button-group class="pull-right">
          <el-button size="small" @click="turnPage('left')" icon="arrow-left"  :disabled="page == 1"></el-button>
          <el-button size="small" @click="turnPage('right')" icon="arrow-right" :disabled="pageMax"></el-button>
        </el-button-group>
      </div>

      <div class="bottom">
        <el-table
          v-loading="requestChargingLoading"
          ref="multipleTable"
          :data="chargingTableData"
          border
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="getSectionRow"
          >
          <el-table-column
            type="selection"
            prop="gid"
            align="center"
            @select="getSectionRow"
            width="55">
          </el-table-column>
          <el-table-column
            prop="carType"
            label="车辆类型"
            align="center"
            width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.carType == ''">未区分类型</span>
              <span v-else-if="scope.row.carType == 0">大型车</span>
              <span v-else-if="scope.row.carType == 1">中型车</span>
              <span v-else-if="scope.row.carType == 2">小型车</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="ruleType"
            label="收费类型"
            align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.ruleType == 0">按时收费</span>
              <span v-else-if="scope.row.ruleType == 1">固定车辆收费</span>
              <span v-else-if="scope.row.ruleType == 2">异常放行收费</span>
              <span v-else-if="scope.row.ruleType == 3">特殊车辆不收费</span>
              <span v-else>不区分车辆类型</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="ruleName"
            align="center"
            label="规则名称"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="description"
            align="center"
            label="描述"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="description"
            align="center"
            label="修改"
            show-overflow-tooltip>
             <template slot-scope="scope">
              <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"><i class="el-icon-edit"></i> 编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <charging-add v-if="addRulesVisible" @cancel="chargingAdded"></charging-add>
    <charging-edit :rules="rules" v-if="editRulesVisible" @cancel="chargingEdited"></charging-edit>
  </div>
</template>
<script type="text/javascript">
var base64 = require('base-64')
import panelTitle from '@/components/panel_title';
import chargingAdd from '@/components/charging/add';
import chargingEdit from '@/components/charging/edit';
export default {
    name: 'charging',
    data() {
      return {
        add_rules_dialog_show: false,
        requestChargingLoading: true,
        pageMax: false,
        selectedParkingRow: [],
        chargingTableData: [],
        page: 1,
        addRulesVisible: false,
        editRulesVisible: false,
        rules: {}
      }
    },
    components: {
      panelTitle,
      chargingAdd,
      chargingEdit
    },
    mounted(){
      this.admin_id = JSON.parse(sessionStorage.getItem('user')).admin.admin_id;
      this.getChargingList();
    },
    methods: {
      chargingEdited(){

        let page =  this.page;

        this.editRulesVisible = false
        this.getChargingList(page)

      },
      chargingAdded(){
        this.addRulesVisible = false

        this.getChargingList(1)
      },
      addRulesVisibleHandler(){
        this.addRulesVisible = true
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },


      handleSelectionChange(val) {
        this.multipleSelection = val;
      },

      //修改收费规则
      handleEdit(index, val){
        this.rules = val
        this.editRulesVisible = true;
      },

      //获取选中行
      getSectionRow(index){
        this.selectedParkingRow = [];
        index.forEach( i => {
           this.selectedParkingRow.push(parseInt(i.gid))
        })
      },

      //删除收费规则
      deleteChargingRules(){
        var that = this;
        var deleteRulesData = base64.encode(JSON.stringify(this.selectedParkingRow))
        console.log(JSON.stringify(this.selectedParkingRow))
        this.$jquery.post(this.$request, {
          action: 'charge_rules_del',
          admin_id: this.admin_id,
          gid: deleteRulesData
        }, res => {
          const response = res;
          if( response.error_code == '0' ) {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '删除成功'
            })
            that.getChargingList()
          } else {
            this.$notify({
              type: 'error',
              title: '失败',
              message: response.msg
            })
          }
        }, 'json')
      },

      //收费列表上翻页
      turnPage( direction ){
        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getChargingList(page)
        this.page = page;
        console.log(this.page)
      },
      //获取收费规则列表
      getChargingList(page){
        console.log('page', page)
        const that = this;
        this.requestChargingLoading = true;
        this.$jquery.post(this.$request, {
          action: 'charge_rules_list',
          admin_id: that.admin_id,
          page: page
        }, res => {
          console.log(res)
          if(res.error_code == '0'){
            this.chargingTableData = res.data
          } else {
            this.$notify({
              type:'error',
              title: '错误',
              message: res.msg
            })
          }

          this.pageMax = res.data.length > 0 ? false : true;
          this.requestChargingLoading = false
        }, 'json')
      }
    }
  }
</script>
<style lang="scss">
.pull-right{
      float: right;
    }
  #charging{
    padding: 0 20px;
  }
  .add_rules_container{
    width: 100%;
    background: white;
    overflow: hidden;
    box-sizing: border-box;
    .form-group{
      p{
        margin:0;
        margin-bottom: 5px;
      }
    }
    .left{
      width: 50%;
      float: left;
      margin-right: 2%;
      .el-select{
        width: 100%;
      }

    }
    .right{
      width: 48%;
      float: left;
    }
  }

  .charging_table{
    background: white;
    border: 1px solid #ddd;
    padding: 20px;
    margin-top: 30px;
    border-radius: 5px;
  }
  .bottom{
    margin-top: 20px;
  }
  .form-group{
    margin-bottom: 20px;
    p{
      margin-bottom: 10px;
    }
  }
  .el-textarea__inner{
    padding-bottom: 50px;
  }
</style>
