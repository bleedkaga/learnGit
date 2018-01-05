<template lang="html">
  <div class="recharge-activity-setting">
    <panel-title title="基础设置"></panel-title>
    <base-panel></base-panel>
  </div>
</template>

<script>
import panelTitle from '@/components/panel_title';
import basePanel from '@/components/baseSetting/base';

export default {
  data(){
    return {

    }
  },
  methods: {
    recharge_query_handler(){
      this.recharge_query.loading = true;

      setTimeout(() => {
        this.recharge_query.loading = false
      }, 3000)
    },
    create_activity(){

      this.create_activity_data.loading = true;

      setTimeout( ()=>{
        this.create_activity_data.loading = false;
        this.create_activity_dialog = false;
      }, 1000)
    }
  },
  components: {
    panelTitle,
    basePanel
  }
}
</script>

<style lang="scss">
$yellow: #fee395;
$green: #b9ea9a;
$blue: #a1d0ef;
$red: #e2a19c;
$purple: #d1acda;
.recharge-activity-setting{
  padding: 0 20px;
  .el-upload__input{
    display: none;
  }

  .panel_setting_container{
    background: white;
    border: 1px solid #bfcbd9;
    min-height: 400px;
    margin-bottom: 30px;
    .btn_container{
      button,input{
        display: block;
        width: 100%;
        margin-bottom: 20px;
      }
    }
    .head{
      padding: 15px 0;
      border-bottom: 2px solid red;
      text-align: center;
    }
    .yellow{
      border-color: $yellow;
    }
    .green{
      border-color: $green;
    }
    .blue{
      border-color: $blue
    }
    .red{
      border-color: $red;
    }
    .purple{
      border-color: $purple
    }
    .body{
      padding: 20px;
    }
    .form_group{
      margin-bottom: 20px;
    }
    .block{
      display: block;
    }
    .el-checkbox__label{
      font-weight: normal;
    }
    .f_right{
      float: right;
    }
  }
  .clear_panel{
    background: transparent;
    border:none;
    padding-top: 35%;
  }
  .upload-demo{
    margin-top: 5px;
  }

  .activity_table_list{
    .operation{
      padding: 0 20px;
      .f_right{
        float: right;
        text-align: right;
        padding-right: 0px;
        margin: 0;
        .el-button-group{
          margin:0;
        }
      }
      .custom-icon-stop{
        display: inline-block;
      }
      .custom-icon-stop:after{
        content: '';
        width: 12px;
        height: 12px;
        margin-right: 2px;
        margin-bottom: -2px;
        display: inline-block;
        border-radius: 2px;
        background: #444;
      }
    }
    .activity_table{
      margin: 20px;
    }
  }
  .panel_search{
    margin-top: 40px;
    padding: 20px;
    border: 1px solid #ddd;
    background: white;
    margin-bottom: 10px;
  }
  .panel_recharg{
    margin-top: 30px;
  }
  .panel_recharge_item{
    margin: 10px 0;
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
    }
  }
  .panel_setting{
    margin-top: 30px;
    padding: 15px;
    border: 1px solid #ddd;
    background: white;
    margin-bottom: 10px;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }
}
</style>
