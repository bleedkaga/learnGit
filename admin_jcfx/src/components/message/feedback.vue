<template>
  <div id="earth">
    <panel-title title="消息反馈"></panel-title>

    <el-row :gutter="30">
      <el-col :span="6">
        <div class="request">
          <div class="form_group ">
            <p>起止日期</p>
            <el-date-picker
              v-model="startTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              placeholder="选择日期时间">
            </el-date-picker>
            <el-date-picker
              v-model="endTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm"
              placeholder="选择日期时间">
            </el-date-picker>
          </div>
          <div class="form_group ">
            <p>反馈类型</p>
            <el-select v-model='logType' placeholder="请选择日志类型">
              <el-option v-for="item in logType_options" :label="item.label" :value="item.value" :key="item.key"></el-option>
            </el-select>

          </div>
          <div class="form_group">
            <el-button type="primary" class="request_btn" :loading="btnLoading" @click="requestHistory">查询</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="request_table">
          <span class="f_right">
            <el-button-group>
              <el-button size="small" icon="arrow-left" :disabled="page == 1" @click="turnPage('left')"></el-button>
              <el-button size="small" icon="arrow-right" :disabled="pageMax" @click="turnPage('right')"></el-button>
            </el-button-group>
          </span>
          <el-table
            :data="feedbackTable"
            v-loading="tableLoading"
            style="width: 100%">
            <el-table-column width="10"></el-table-column>
            <el-table-column
              prop="userId"
              label="用户ID"
              width="330">
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="反馈时间"
              width="180">
            </el-table-column>
            <el-table-column
              prop="type"
              label="反馈类型"
              width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.type == 0">软件bug</span>
                <span v-else-if="scope.row.type == 1">建议</span>
                <span v-else-if="scope.row.type == 2">其他</span>
                <span v-else>未知软件类型</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="desc"
              label="问题描述">
              <template slot-scope="scope">
                <p class="problem">{{scope.row.content}}</p>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script type="text/javascript">
import search from '@/components/search'
import panelTitle from '@/components/panel_title'
import { formatDate } from '@/common/date.js'
var base64 = require('base-64')

export default {
    name: 'history',
    data() {
      return {
        startTime: '',
        endTime: '',
        feedbackTable: [],
        tableLoading: false,
        btnLoading: false,
        page: 1,
        pageMax: false,
        logType: '',
        logType_options: [
          { value: '0', label: '软件bug'},
          { value: '1', label: '建议'},
          { value: '2', label: '其他'},
        ]
      }
    },
    components: {
      search,
      panelTitle
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;
      this.getHistoryList()
    },
    methods: {

      getHistoryList(data, page){
        const that = this;
        this.tableLoading = true
        this.$jquery.post(that.$request, {
          action: 'feedback_list',
          admin_id: that.admin_id,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.feedbackTable = res.data
          } else {
            that.feedbackTable = []
            that.$message({
              type: 'error',
              message: res.msg
            })
          }

          that.pageMax = res.data ? false : true;
          that.tableLoading = that.btnLoading =  false;
        }, 'json')
      },

      //按条件查询
      requestHistory(){
        const that = this;
        var params;
        var start = that.startTime ? formatDate( that.startTime, "yyyy-MM-dd hh:mm") : "",
            end = that.endTime ?  formatDate( that.endTime, "yyyy-MM-dd hh:mm"): "";

        if(start > end){
          this.$message({type: 'warning', message: that.tips.TIME_ERROR})
          return
        }
        params = {
          "start": start,
          "end": end,
          type: that.logType
        }

        params = base64.encode(JSON.stringify(params))

        this.btnLoading = true;
        this.getHistoryList(params, 1)
      },

      turnPage( direction ){
        let that = this;
        var start = that.startTime ? formatDate( that.startTime, "yyyy-MM-dd hh:mm") : "",
            end = that.endTime ?  formatDate( that.endTime, "yyyy-MM-dd hh:mm"): "";
        var params = {
          "start": start,
          "end": end,
          type: that.logType
        }
        params = base64.encode(JSON.stringify(params))

        var page = this.page;
        if( direction == 'left'){
          page--
        } else {
          page++
        }
        this.getHistoryList(params, page)
        this.page = page;
      },

    },
    filters: {
      formatDate(time){
        var date = new Date( time );
        return formatDate(date, "yyyy-MM-dd hh:mm");
      },
    }
  }
</script>
<style lang="scss">
#earth{
  padding: 0 20px;

  .request{
    background: white;
    border: 1px solid #ddd;
    padding: 0 20px;
    margin-top: 20px;
    padding-top: 20px;
    p{
      font-size: 14px;
      margin:0px;
      margin-bottom: 5px;
    }

    .el-date-editor.el-input, .el-select{
      width: 100%;
    }
    .form_group{
      margin-bottom: 20px;
    }
    p + * {
      margin-bottom: 10px;
    }
  }
  .panel_detail{
    width: 80%;
    margin: 30px auto;
    border: 1px solid #ddd;
    background: white;
    .top{
      text-align: center;
      font-size: 16px;
      padding: 40px 0;
      border-bottom: 1px solid #ddd;
    }
    .body{
      padding: 30px;
      font-size: 14px;
    }
  }
  .request_table{
    background: white;
    border: 1px solid #ddd;
    padding: 20px;
    margin-top: 20px;
  }
  .request_btn{
    display: block;
    width: 100%;
    margin-top: 100px;
    margin-bottom:20px;
  }
  .f_right{
    float: right;
    margin-bottom: 20px;
  }
  .problem{
    color: #eaa262;
    text-decoration: underline;
    cursor: pointer;
  }
}

</style>
