<template>
  <div id="earth">
    <panel-title title="推送消息"></panel-title>
    <div class="message_container">
      <div class="form_group">
        <p>标题</p>
        <el-input placeholder="请输入标题" v-model="title"></el-input>
      </div>
      <div class="form_group">
        <p>正文 <span style="float:right">{{word.length}} / 200</span></p>
        <el-input type="textarea" :maxlength="200" :rows="20" placeholder="请输入正文" v-model="word"></el-input>
      </div>
      <div class="form_group send">
        <el-button type="primary" :disabled="title == '' || word == '' " :loading="sendLoading"  @click="sendPushMessage">发 送</el-button>
      </div>
    </div>
  </div>


</template>
<script type="text/javascript">
import search from '@/components/search'
import panelTitle from '@/components/panel_title'
var base64 = require('base-64')

export default {
    name: 'earthMagnetic',
    data() {
      return {
        title: '',
        word: '',
        sendLoading: false
      }
    },

    components: {
      search,
      panelTitle
    },
    mounted(){
      this.admin_id = JSON.parse( sessionStorage.getItem('user')).admin.admin_id;

    },
    methods: {

      sendPushMessage(){
        const that = this;
        this.sendLoading = true;
        var msg = {
          title: encodeURI(that.title),
          content:encodeURI(that.word)
        }
        msg = base64.encode( JSON.stringify(msg))

        this.$jquery.post(this.$request, {
          action: 'news_push',
          admin_id: that.admin_id,
          data: msg
        }, res => {
          if( res.error_code == '0'){
            this.$message({
              type: 'success',
              message: '添加成功'
            })

            that.title = that.word = '';
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.sendLoading = false;
        }, 'json')
      }
    }
  }
</script>
<style lang="scss">
#earth{
  padding: 0 20px;
  .message_container{
    padding: 20px;
    margin-top: 30px;
    background: white;
    border:1px solid #ddd;
  }
  .form_group{
    margin-bottom: 20px;
    p{
      margin:0;
      margin-bottom: 5px;
    }
  }
  .send{
    margin-top: 30px;
  }
}

</style>
