<template>
  <div id="charging">
    <panel-title title="综合查询"></panel-title>

    <div class="integreted_query_group">
      <el-row :gutter="30">
        <el-col :span="6" v-for="(item, index) in querys" :key="index">
          <div class="btn_item " :class="{'active': item.selected}" @click="query(item.name, index)">
            {{item.text}}
          </div>
        </el-col>
      </el-row>
    </div>
    <router-view ></router-view>
  </div>
</template>
<script type="text/javascript">
import panelTitle from '@/components/panel_title'
export default {
    name: 'charging',
    data() {
      return {
        querys: [
          {
            selected: true,
            name: 'site',
            text: '场内车辆查询'
          },
          {
            selected: false,
            name: 'record',
            text: '充值记录查询'
          },
          {
            selected: false,
            name: 'order',
            text: '订单查询'
          },
          {
            selected: false,
            name: 'book_order',
            text: '预约订单查询'
          },

        ]
      }
    },
    mounted(){
      this.btnActive()
    },
    methods: {
      query(queryName, index){
        this.querys.map( (i)=> {
          i.selected = false
        });
        this.querys[index].selected = true;
        this.$router.push('/integrated_query/'+queryName)
      },
      btnActive(){
        const active = this.$route.path.split('/')[2];
        for(var i in this.querys){
          if( active == this.querys[i].name){
            this.query(active, i)
          }
        }

      }
    },
    components: {
      panelTitle
    }
  }
</script>
<style lang="scss">
  #charging{
    padding: 0 20px;
  }
  .integreted_query_group{
    margin-top: 30px;
    .btn_item{
      background: white;
      padding: 30px 0;
      text-align: center;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    .active{
      background: #3495dd;
      color: white;
      position: relative;
      &:after{
        content: "";
        width: 10px;
        height: 10px;
        position: absolute;
        left: 50%;
        bottom:-5px;
        transform: rotateZ(-45deg);
        background: #3495dd;

      }
    }
  }
.panel_book_order{
  margin: 30px 0;
  .panel_recharge_item{
    background: white;
    border:1px solid #bfcbd9;
    padding: 20px 0;
    overflow: hidden;
    border-radius: 4px;
    .f_left{
      float: left;
      width: 60%;
      padding-left: 20px;
    }
    .f_right{
      float: right;
      width: 40%;
      padding-right: 20px;
      text-align: right;
      .el-button-group{
        margin-left: 0;
        margin-right: 0 !important;
      }
    }
  }
  .clear_margin{
    .panel_search{
      margin:10px 0;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
    }
  }
  .panel_group{
    padding: 0 20px;
    .el-input{
      margin-bottom: 10px;
    }
    .el-input{
      width: 100%;
    }
    .el-select{
      width: 100%;
    }
    .el-button{
      display: block;
      width: 100%;
      margin-top: 200px;

    }
  }
  .f_right{
    float: right;
  }
  .activity_table_list{
    .operation{
      padding: 0 20px;
      .el-button-group{
        margin: 0;
        margin-right: 20px;
      }
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
      }
      .custom-icon-stop{
        display: inline-block;
      }
    }
    .activity_table{
      margin: 20px;
    }
    .cell{
      padding-left: 8px;
      padding-right: 8px;
    }
  }
}

//充值记录

.panel_recharg{
  .panel_recharge_item{

    background: white;
    border:1px solid #bfcbd9;
    padding: 30px 0;
    overflow: hidden;
    border-radius: 4px;
    .f_left{
      float: left;
      width: 40% !important;
      padding-left: 20px;
    }
    .f_right{
      float: right;
      width: 40%;
      padding-right: 20px;
      text-align: right;
    }
  }
  .clear_margin{
    .panel_search{
      margin:0px 0;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
    }
  }
  .panel_group{
    padding: 0 20px;
    .el-input{
      margin-bottom: 10px;
    }
    .el-input{
      width: 100%;
    }
    .el-select{
      width: 100%;
    }
    .el-button{
      display: block;
      width: 100%;
      margin-top: 200px;

    }
  }
  .f_right{
    float: right;
  }
  .activity_table_list{
    .operation{
      padding: 0 20px;
      .el-button-group{
        margin: 0;
        margin-right: 20px;
      }
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
      }
      .custom-icon-stop{
        display: inline-block;
      }
    }
    .activity_table{
      margin: 20px;
    }
  }
}
</style>
