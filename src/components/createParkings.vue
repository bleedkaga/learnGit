<template>
  <div class="createParkings">
    <div class="panel_setting" >
      <el-row :gutter="10">
        <el-col :span="2">
          <div class="setting" @click=""><span  style="line-height:36px;"><i class="el-icon-arrow-left"></i> 设置</span></div>
        </el-col>
        <el-col  :span="5">
          <div class="parking_name">
            <el-row>
              <el-col :span="6"><span style="line-height:36px;"><i style="color:red">*</i>停车场名称：</span></el-col>
              <el-col :span="18"><el-input ></el-input></el-col>
            </el-row>
          </div>
        </el-col>
        <el-col  :span="6">
          <div class="map_import">
            <el-row>
              <el-col :span="7"><span style="line-height:36px;"><i style="color:red">*</i>室内地图导入：</span></el-col>
              <el-col :span="17">
                <!-- <el-upload
                  class="upload-demo"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :file-list="fileList">
                  <el-button size="small" type="primary">点击上传</el-button>
                </el-upload> -->
                <input type="file" name="">
              </el-col>
            </el-row>
          </div>
        </el-col>

      </el-row>
    </div>

    <div class="panel_recharg" >

      <el-row :gutter="20" style="display:none;">
        <el-col :span="24">
          <div class="panel_recharge_item activity_table_list">
            <div class="operation">
              <el-button @click="create_activity_dialog = true" size="small"><i class="el-icon-plus"></i> 创建停车场</el-button>


              <span class="f_right">
                <el-button-group>
                  <el-button size="small"><i class="el-icon-arrow-left"></i></el-button>
                  <el-button size="small"><i class="el-icon-arrow-right"></i></el-button>
                </el-button-group>
              </span>
            </div>  <!--opration end-->

            <div class="activity_table" >
              <el-table
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">

                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>

                <el-table-column
                  prop="name"
                  label="停车场"
                  align="center"
                  width="120">
                  <!-- <template slot-scope="scope">{{ scope.row.date }}</template> -->
                </el-table-column>

                <el-table-column
                  prop="startTime"
                  label="停车场总车位"
                  align="center"
                  width="120">
                </el-table-column>

                <el-table-column
                  prop="endTime"
                  label="免费停车时长"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="price"
                  label="免费出场时间"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="out_price"
                  label="是否可预约"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

                <el-table-column
                  prop="giving_price"
                  label="收费规则名称"
                  align="center"
                  show-overflow-tooltip>
                </el-table-column>

              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="30">
        <el-col :span="6" >
          <div class="parking_space_number panel_setting_container">
            <div class="head yellow">车位数设置</div>
            <div class="body">
              <div class="form_group">
                <p>所属停车场</p>
                <div class="block">
                  <el-input></el-input>
                </div>
              </div>
              <div class="form_group">
                <p>已停车位</p>
                <div class="block">
                  <el-input></el-input>
                </div>
              </div>
              <div class="form_group">
                <p>剩余车位</p>
                <div class="block">
                  <el-input></el-input>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head green">允许车辆通过类型</div>
            <div class="body">
              <div class="block form_group"><el-checkbox >大型车</el-checkbox></div>
              <div class="block form_group"><el-checkbox >中型车</el-checkbox></div>
              <div class="block form_group"><el-checkbox >小型车</el-checkbox></div>
              <div class="block form_group"><el-checkbox >其他</el-checkbox></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head blue">添加收费规则</div>
            <div class="body">
              <div class="block form_group"><el-checkbox >企福天地按时收费规则</el-checkbox></div>
              <div class="block form_group"><el-checkbox >企福天地固定车位收费规则</el-checkbox></div>
              <div class="block form_group"><el-checkbox >企福天地按时收费规则</el-checkbox></div>
              <div class="block form_group"><el-checkbox >企福天地固定车位收费规则</el-checkbox></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head red">免费停车时间设置</div>
            <div class="body">
              <div class="form_group">
                <p>免费停车时长</p>
                <div class="block">
                  <el-input placeholder="请输入免费停车时长"></el-input>
                </div>
              </div>
              <div class="form_group">
                <p>免费出场时间</p>
                <div class="block">
                  <el-input placeholder="请输入免费出场时间"></el-input>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head yellow">停车场分区设置</div>
            <div class="body">
              <div class="form_group">
                <p>免费停车时长</p>
                <div class="block">
                  <el-input placeholder="请输入免费停车时长"></el-input>
                </div>
              </div>
              <div class="form_group">
                <p>免费出场时间</p>
                <div class="block">
                  <el-input placeholder="请输入免费出场时间"></el-input>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head purple">停车场位置</div>
            <div class="body">
              <div class="form_group">
                <p>重庆市两江新区黄山大道中麒麟座D</p>
              </div>
              <el-button type="primary">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container">
            <div class="head green">预约设置（仅拥有智能锁的停车场可用）</div>
            <div class="body">
              <div class="form_group">
                车位是否可预约
                <el-switch
                  class="f_right"
                  v-model="make"
                  on-text=""
                  off-text="">
                </el-switch>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="parking_space_number panel_setting_container clear_panel">
            <div class="btn_container">
              <div class="block"><el-button>取消</el-button></div>
              <div class="block"><el-button type="primary">保存</el-button></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'createParkings'
  }
</script>
