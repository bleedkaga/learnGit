<template>
  <div id="earth">
    <panel-title title="消息历史"></panel-title>
    <search v-if="!details" placeholder="标题" @search="search_val"></search>
    <span v-else class="history_detail" @click="details = false"><i class="el-icon-arrow-left"></i>查看详情</span>

    <div class="panel_detail"  v-if="details">
      <div class="top">{{dTitle}}</div>
      <div class="body">{{dContent}}</div>
    </div>
    <el-row :gutter="30" v-else>
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
            :data="historyTable"
            v-loading="tableLoading"
            style="width: 100%">
            <el-table-column
              prop="title"
              label="标题"
              width="180">
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="发送时间"
              width="180">
            </el-table-column>
            <el-table-column
              prop="operator"
              label="操作员">
            </el-table-column>
            <el-table-column
              prop="address"
              label="查看详情">
              <template slot-scope="scope">
                <el-button type="primary" size="small" @click="detail(scope.row.title, scope.row.content)">查看</el-button>
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
var base64 = require('base-64')
import { formatDate } from '@/common/date.js';
export default {
    name: 'history',
    data() {
      return {
        startTime: '',
        endTime: '',
        historyTable: [],
        tableLoading: false,
        btnLoading: false,
        page: 1,
        pageMax: false,
        dTitle: '',
        dContent: '',
        details: false,
        keyword: ''
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

      getHistoryList(name, data, page){
        const that = this;

        this.tableLoading = true
        this.$jquery.post(that.$request, {
          action: 'news_list',
          admin_id: that.admin_id,
          title: name,
          data: data,
          page: page
        }, res => {
          if( res.error_code == '0'){
            that.historyTable = res.data
          } else {
            that.historyTable = []
            that.$message({
              type: 'error',
              message: res.msg
            })
          }

          that.pageMax = res.data ? false : true;
          this.tableLoading = this.btnLoading =  false;
        }, 'json')
      },
      getCondition(){
        let _this = this;
        var start = this.startTime ? formatDate(this.startTime, "yyyy-MM-dd hh:mm"): '';
        var end = this.endTime ? formatDate(this.endTime, "yyyy-MM-dd hh:mm"): '';

        if(start > end){
          this.$message({type: 'warning', message: _this.tips.TIME_ERROR})
          throw _this.tips.TIME_ERROR
        }
        var params = {
          "start": start,
          "end": end
        }
        return base64.encode(JSON.stringify(params))
      },
      //按条件查询
      requestHistory(){
        const that = this;
        const condition = this.getCondition()
        this.btnLoading = true;

        this.getHistoryList(that.keyword, condition, 1)
      },
      search_val(val){
        this.keyword = val;
        this.getHistoryList(val,'','')
      },
      turnPage( direction ){
        let that = this;
        var page = this.page;
        const condition = this.getCondition();

        if( direction == 'left'){
          page--
        } else {
          page++
        }

        this.getHistoryList(this.keyword, condition, page)
        this.page = page;
      },

      detail(title, content){
        this.details = true;
        this.dTitle = title;
        this.dContent = content;
      }
    },
    filters: {
      formatDate(time){
        var date = new Date( time );
        return formatDate( date, "yyyy-MM-dd hh:mm");
      }
    }
  }
</script>
