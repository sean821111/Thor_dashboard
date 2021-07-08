<template>
  <div class="app-container">
        <div class="info-container">
          <el-row>
            <span style="float:left;">
              <h1>{{resident.bedNumber}}床-住民床位資訊編輯</h1>
            </span>
            <span style="float:right;">
              <el-button type="success" @click="save">儲存</el-button>
              <el-button type="warning" @click="cancel">取消</el-button>
            </span>
          </el-row>
          <el-row :gutter="30">
            <el-col :span=6>
              <h2>住民資訊</h2>
            </el-col>
            <el-col :span=6>
              <h2>住民身體狀況</h2>
            </el-col>
            <el-col :span=6>
              <h2>裝置資訊</h2>
            </el-col>
          </el-row>

          <el-form
            class="resident-info"
            ref="residentData"
            :model="resident"
            label-width="100px"
            size="35"
          >
            <el-row :gutter="30">
              <el-col :span="6">
                <el-form-item label="姓名：">
                  <el-input v-model="resident.info.name" v-show="editInfo" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item label="性別：">
                  <div class="grid-content" v-show="editInfo">
                    <el-radio v-model="resident.info.gender" label="M">男</el-radio>
                    <el-radio v-model="resident.info.gender" label="F">女</el-radio>
                  </div>
                </el-form-item>

                <el-form-item label="身份證字號:">
                  <el-input v-model="resident.info.idNumber" v-show="editInfo" style="width: 150px"></el-input>
                </el-form-item>

                <el-form-item label="身高:">
                  <el-input v-model="resident.info.height" v-show="editInfo" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="體重:">
                  <el-input v-model="resident.info.weight" v-show="editInfo" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="出生日期:">
                        <el-date-picker
                        style="width: 160px"
                        type="date"
                        v-model="resident.info.birthday"
                        v-show="editInfo"
                        ></el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="身體狀況：">
                  <el-input
                    type="textarea"
                    v-model="resident.health"
                    v-show="editInfo"
                  ></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="床號：">
                  <el-input v-model="resident.bedNumber" v-show="editInfo"></el-input>
                </el-form-item>

                <el-form-item label="Thor裝置1：">
                  <el-select v-model="thorDeviceNames[0]" placeholder="Select">
                    <el-option
                      v-for="deviceName in validThorDeviceNames"
                      :key="deviceName"
                      :value="deviceName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Thor裝置2：">
                  <el-select v-model="thorDeviceNames[1]" placeholder="Select">
                    <el-option
                      v-for="deviceName in validThorDeviceNames"
                      :key="deviceName"
                      :value="deviceName">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

            </el-row>
          </el-form>
        </div>
  </div>
</template>


<script>
import { getDeviceList } from "@/api/device";
import { updateResident } from "@/api/resident"

export default {
  name: "EditInfo",

  data() {
    return {
      editInfo: true,
      thorDeviceNames: ['null', 'null'],
      validThorDeviceNames: ['null']
    };
  },
  props: {
    resident: {
      type: Object,
      default: null,
      required: true,
    }
  },
  created(){
    this.fetchDeviceData();
  },

  methods: {
    fetchDeviceData() {
      getDeviceList().then((response) => {
        for (var i = 0; i < this.resident.thorDevices.length; i++) {
          this.validThorDeviceNames.push(this.resident.thorDevices[i].name);
          this.thorDeviceNames[i] = this.resident.thorDevices[i].name;
        }
        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].resident == null) {
            this.validThorDeviceNames.push(response.data[i].name);
          }
        }
        console.log('this.validThorDeviceNames: ' + JSON.stringify(this.validThorDeviceNames))
        
      });
    },
    save(){
      this.thorDeviceNames = this.thorDeviceNames.filter(deviceName => deviceName != 'null'); 
      let data = {
        info: this.resident.info,
        health: this.resident.health,
        bedNumber: this.resident.bedNumber,
        remark: this.resident.remark,
        pairsDeviceName: (this.resident.pairsDevice == null) ? null : this.resident.pairsDevice._id,
	      thorDeviceNames: this.thorDeviceNames
      };
      updateResident(this.resident._id, data).then((response) => {
        this.$emit("reload");
      });
    },
    cancel(){
      this.$emit("info-mode");
    },
  },
};
</script>

<style scoped>
.info-container {
  border-left: 1px solid;
  border-right: 1px solid;
  border-color: #cccccc;
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
}
.resident-info >>> .el-form-item__label {
  font-size: 16px;
}
.grid-content {
  min-height: 8px;
  /* background-color: #f9fafc; */
}
.el-row {
  margin-bottom: 10px;
}
.el-col{
    column-gap: 40px;
}
</style>

