<template>
  <div class="app-container">
        <div class="info-container">
          <el-row>
            <span style="float:left;">
              <h1>住民資訊新增</h1>
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
            ref="form"
            :model="form"
            label-width="120px"
            size="35"
          >
            <el-row :gutter="30">
              <el-col :span="6">
                <el-form-item label="姓名：">
                  <el-input v-model="form.info.name" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item label="性別：">
                  <div class="grid-content">
                    <el-radio v-model="form.info.gender" label="M">男</el-radio>
                    <el-radio v-model="form.info.gender" label="F">女</el-radio>
                  </div>
                </el-form-item>

                <el-form-item label="身份證字號:">
                  <el-input v-model="form.info.idNumber" style="width: 150px"></el-input>
                </el-form-item>

                <el-form-item label="身高:">
                  <el-input v-model="form.info.height" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="體重:">
                  <el-input v-model="form.info.weight" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="出生日期:">
                        <el-date-picker
                        style="width: 160px"
                        type="date"
                        v-model="form.info.birthday"
                        ></el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="身體狀況：">
                  <el-input
                    type="textarea"
                    v-model="form.health"
                  ></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="床號：">
                  <el-input v-model="form.bedNumber"></el-input>
                </el-form-item>

                <el-form-item label="Thor裝置1：">
                  <el-select v-model="form.thorDeviceNames[0]" placeholder="Select">
                    <el-option
                      v-for="deviceName in validThorDeviceNames"
                      :key="deviceName"
                      :value="deviceName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Thor裝置2：">
                  <el-select v-model="form.thorDeviceNames[1]" placeholder="Select">
                    <el-option
                      v-for="deviceName in validThorDeviceNames"
                      :key="deviceName"
                      :value="deviceName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <!-- <el-form-item label="Pairs裝置：">
                  <el-select v-model="form.pairsDeviceName" placeholder="Select">
                    <el-option
                      v-for="device in validPairsDevices"
                      :key="device.address"
                      :label="device.name"
                      :value="device.address">
                    </el-option>
                  </el-select>
                </el-form-item> -->
              </el-col>

            </el-row>
          </el-form>
        </div>
  </div>
</template>


<script>
import { getDeviceList } from "@/api/device";
import { addResident } from "@/api/resident";


export default {
  name: "NewResident",

  data() {
    return {
      form:{
        info: {
          name:'',
          gender:'',
          idNumber:'',
          height:'',
          weight:'',
          birthday:'',
        },
        health:'',
        bedNumber:'',
        remark: null,
        thorDeviceNames: ['null', 'null'],
        pairsDeviceName: null
      },
      validThorDeviceNames: ['null'],
      validPairsDevices: ['null']
    };
  },
  created(){
    this.fetchDeviceData();
  },

  methods: {
    fetchDeviceData() {
      getDeviceList().then((response) => {
        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].resident == null) {
            this.validThorDeviceNames.push(response.data[i].name);
          }
        }
        console.log('this.validThorDeviceNames: ' + JSON.stringify(this.validThorDeviceNames))
      });
    },
    cancel() {
      console.log("cancel");
      this.$router.push({ path: this.redirect || "/dashboard"});
    },
    save() {
      console.log("save");
      this.form.thorDeviceNames = this.form.thorDeviceNames.filter(deviceName => deviceName !== 'null'); 
      console.log("form: " + JSON.stringify(this.form));
      addResident(this.form).then((response) => {
        console.log("response: " + JSON.stringify(response));
        this.$router.push({ path: this.redirect || "/dashboard"});
      })
      
      
    }
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

