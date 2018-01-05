<template>
  <div class="location">
    <div class="location-search">
      <el-row :gutter="10">
        <el-col :span="6">
          <div class="setting pointer" @click="returnToParent"><span  style="line-height:36px;"><i class="el-icon-arrow-left"></i> 设置</span></div>
        </el-col>
        <el-col  :span="18">
          <el-input placeholder="搜索" v-model="input" >
            <el-button slot="append" icon="search" @click="searchMap"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <div class="map">
      <el-row :gutter="10">
        <el-col :span="6">
          <div class="location_opera">
            <span v-text="parkingname"></span>
            <p v-model="address" id="geo"></p>
            <el-button type="primary" @click="set">保 存</el-button>
          </div>
        </el-col>
        <el-col  :span="18">
          <div class="container" id="container" v-loading="mapLoading">

          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog :visible.sync="mapSearchResultVisible" title="搜索结果">
      <div class="map_search_result">
        <div v-if="resultList.length == 0">没有查询到您想要的结果</div>
        <ul v-else>
          <li v-for="item in resultList" @click="positionMap(item.location)">{{item.pname}}{{item.name}}</li>
        </ul>
      </div>
     <!--  <span slot="footer" class="dialog-footer">
        <el-button @click="parkingSpaceSettingVisible = false" >取 消</el-button>
        <el-button type="primary" @click="submitParkingSetting" :disabled="parkingNo == '' || areaId == ''" >保 存</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>
<script>
  import AMap from 'AMap';
  import search from '@/components/search';
  var placeSearch = undefined;
  var geoLocation = {};
  var map;
  export default {
    name : 'location',
    props: ['parkingname', 'location', 'areaId', 'parkingNo'],
    data(){
      return {
        input: '',
        mapLoading: false,
        address: '',
        mapSearchResultVisible: false,
        resultList: []
      }
    },
    mounted(){
      var geo = null;
      var that = this;
      var geos = {};
      var fromParentComponent = this.$props.location;
      console.log('接收的位置是，'+JSON.stringify(fromParentComponent))
      getLocations(fromParentComponent, that.parkingname)

    },
    components: {
      search
    },
    methods: {

      set(){
        this.$emit("getlocation", geoLocation)
      },
      returnToParent(){
        this.$emit('back')
      },

      submitParkingSetting(){
        this.set()
      },
      positionMap( location ){
        var location =  location
        this.mapSearchResultVisible = false;
        map.panTo(location.split(','), '在这')
      },
      searchMap(){
        let _this = this;
        let $ = this.$jquery;
        console.log($("#wrapper"))
        $("#wrapper").scrollTop(100)
        this.$jquery.post('https://restapi.amap.com/v3/place/text?parameters', {
          key: 'ce1fa24fac409916fd0075c050d33258',
          keywords: _this.input,
          types: ''
        }, res => {
          _this.mapSearchResultVisible = true;
          if(res.status == '1'){
            this.resultList = res.pois;
          } else if (res.status == '1' && res.pois.length == 0){
            this.resultList = [];
          } else {
            _this.$notify({
              type: 'error',
              title: '搜索出错',
              message: res.info
            })
          }

        })
      }
    }
  }

  var s ;
  function getLocations(location, labelName ){
    if(location.x == null || location.y == null){
      location = {
        x:106.5526036490,
        y:29.5621046040
      }
    }
    initMap([location.x, location.y], labelName)
  }



  function initMap(location,  parkingName){

    map = new AMap.Map('container',{
            resizeEnable: true,
            zoom: 13,
            center: location
    });

    AMap.service('AMap.Geocoder',function(){

        var marker = new AMap.Marker({
            map:map,
            position: map.getCenter(),
            bubble:true
        })

        var geocoder = new AMap.Geocoder({
            city: ""//城市，默认：“全国”
        });

        // 设置label标签
        marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
            offset: new AMap.Pixel(-80, -80),//修改label相对于maker的位置
            content: parkingName
        });
        map.on('click',function(e){
            marker.setPosition(e.lnglat);
            geocoder.getAddress(e.lnglat,function(status,result){
              if(status=='complete'){
                console.log(result)
                var address = result.regeocode.formattedAddress
                document.getElementById("geo").innerText = address;
                geoLocation.address= address;
                geocoder.getLocation(address, function(status, result) {
                  if (status === 'complete' && result.info === 'OK') {
                      //TODO:获得了有效经纬度，可以做一些展示工作
                      var geos =  result.geocodes[0].location;

                      geoLocation.lng = geos.lng;
                      geoLocation.lat = geos.lat;

                  }else{
                      //获取经纬度失败
                      alert('经纬度位置获取失败，请重新获取！')
                  }
                });
              }
            })
        })

    });
  }
</script>
<style type="text/css" lang="scss">
  .location{
    .map_search_result{
      max-height: 300px;
      overflow-x: hidden;
      overflow-y: scroll;
      ul{
        margin:0;
        padding:0;
      }
      li{
        list-style-type: none;
        height: 40px;
        line-height: 40px;
        border: 1px solid #f1f1f1;
        padding-left: 10px;
        cursor: pointer;
        position: relative;
      }
      li:after{
        width: 10px;
        height: 10px;
        position: absolute;
        right: 20px;
        content: "";
        top: 14px;
        border-top: 2px solid #ddd;
        border-right: 2px solid #ddd;
        transform: rotateZ(45deg);
        -webkit-transform: rotateZ(45deg);
      }
      li:hover{
        background: #f7fcfe
      }
      li:first-child ~ li{
        border-top: none;
      }
    }
    .amap-marker-label{
      height: 50px;
      width: 180px;
      text-align: center;
      line-height: 40px;
      border:none;
      border: 1px solid #ddd;
      box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
      font-size: 16px;
      position: relative;
      &:after{
        content: "";
        position: absolute;
        width: 12px;
        height: 12px;
        left: 50%;
        bottom: -6px;
        box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
        margin-left: -6px;
        background: white;
        transform: rotateZ(45deg);
      }
    }
    .location-search{
      background: white;
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #bfcbd9;

    }
    #geo{
      height: 50px;
    }
    .map{
      margin-top: 30px;
    }
    .location_opera,.container{
      background: white;
      padding: 20px;
      height: 600px;
      border: 1px solid #bfcbd9;
    }
    .location_opera span{
      font-family: "Microsoft Yahei", 'Avenir', Helvetica, sans-serif;
      font-size: 20px;
    }
    .location_opera p{
      font-size: 18px;
    }
    .location_opera .el-button{
      margin-top: 100px;
      span{
        font-size: 16px;
      }
      width: 100%;
    }
  }

</style>
