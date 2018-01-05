<template>
  <div class="user-detail">
    <div class="integreted_query_group">
      <el-row :gutter="30">
        <el-col :span="6">
          <div  class="btn_item " style="overflow: hidden" @click="backUser">
            <span class="text-left"><i class="el-icon-arrow-left"></i>{{title}}</span>
            <span class="right">用户账号：<i>{{uid}}</i></span>
          </div>
        </el-col>
        <el-col :span="6">
          <div  class="btn_item active" @click="listen('recharge', $event)">
            充值查询
          </div>
        </el-col>

        <el-col :span="6">
          <div  class="btn_item " @click="listen('car', $event)">
            车辆管理
          </div>
        </el-col>

        <el-col :span="6">
          <div  class="btn_item " @click="listen('parkingrecord', $event)">
            停车记录查询
          </div>
        </el-col>
      </el-row>
    </div>

    <recharge :userid="userid" v-if="currentComponents == 'recharge'"></recharge>
    <car :userid="userid" v-else-if="currentComponents == 'car'"></car>
    <parking-record :userid="userid" v-else-if="currentComponents == 'parkingrecord'"></parking-record>
  </div>
</template>
<script>
  import recharge from '@/components/user/recharge.vue';
  import car from '@/components/user/car.vue';
  import parkingRecord from '@/components/user/parking-record.vue';

  export default {
    name: 'user-detail',
    props: ['userid'],
    data(){
      return {
        title: '充值查询',
        currentComponents: 'recharge',
        uid: '',
        querys: [
          {
            selected: true,
            name: 'site',
            text: '充值查询1'
          },
          {
            selected: false,
            name: 'record',
            text: '充值查询'
          },
          {
            selected: false,
            name: 'order',
            text: '车辆管理'
          },
          {
            selected: false,
            name: 'book_order',
            text: '停车记录查询'
          },

        ]
      }
    },
    mounted(){
      this.uid = this.$props.userid;
      console.log('user userid', this.uid)
    },
    methods: {
      query(queryName, index){
        this.querys.map( (i)=> {
          i.selected = false
        });
        this.querys[index].selected = true;
      },
      listen(id, event){
        var $ = this.$jquery
        $('.btn_item').removeClass("active")
        event.target.classList.add('active')
        this.title = event.target.innerText;
        this.uid = this.$props.userid;
        this.currentComponents = id;
      },
      backUser(){
        this.$emit('backuser')
      }
    },

    components: {
      recharge,
      car,
      parkingRecord
    }
  }
</script>
<style type="text/css" lang="scss">

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
    .text-left{
      text-align: left;
      text-indent: 10px;
      float: left;
    }

    .right{
      float: right;
      width: 240px;
      margin-right: 10px;

      i{
        display: inline-block;
        width: 150px;
        overflow: hidden;
        vertical-align:  middle;
        text-overflow: ellipsis;
        white-space: break-word;
      }
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
</style>
