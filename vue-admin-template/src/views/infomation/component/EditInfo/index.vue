<template>
  <div class="app-container">
        <div class="info-container">
          
            <h1>{{residentData.bedNumber}}床-住民床位資訊編輯</h1>

            <el-button
              v-if="editInfo"
              type="success"
              icon="el-icon-circle-check-outline"
              style="float: right"
              @click="confirmEdit"
            >
              儲存
            </el-button>

            <el-button
              class="cancel-btn"
              icon="el-icon-refresh"
              type="warning"
              style="float: right"
              @click="cancelEditPage"
            >
              取消
            </el-button>
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
            :model="residentData"
            label-width="100px"
            size="35"
          >
            <el-row :gutter="30">
              <el-col :span="6">
                <el-form-item label="姓名：">
                  <el-input v-model="residentData.info.name" v-show="editInfo" style="width: 100px"></el-input>
                </el-form-item>
                <el-form-item label="性別：">
                  <div class="grid-content" v-show="editInfo">
                    <el-radio v-model="residentData.info.gender" label="M">男</el-radio>
                    <el-radio v-model="residentData.info.gender" label="F">女</el-radio>
                  </div>
                </el-form-item>

                <el-form-item label="身份證字號:">
                  <el-input v-model="residentData.info.idNumber" v-show="editInfo" style="width: 150px"></el-input>
                </el-form-item>

                <el-form-item label="身高:">
                  <el-input v-model="residentData.info.height" v-show="editInfo" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="體重:">
                  <el-input v-model="residentData.info.weight" v-show="editInfo" style="width: 80px"></el-input>
                </el-form-item>

                <el-form-item label="出生日期:">
                        <el-date-picker
                        style="width: 160px"
                        type="date"
                        v-model="residentData.info.birthday"
                        v-show="editInfo"
                        ></el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="身體狀況：">
                  <el-input
                    type="textarea"
                    v-model="residentData.health"
                    v-show="editInfo"
                  ></el-input>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="床號：">
                  <el-input v-model="residentData.bedNumber" v-show="editInfo"></el-input>
                </el-form-item>

                <el-form-item label="儀器編號：">
                  <el-input
                    v-model="residentData.device.name"
                    v-show="editInfo"
                  ></el-input>
                </el-form-item>
              </el-col>

            </el-row>
          </el-form>
        </div>
  </div>
</template>


<script>
import {getResidentInfo} from "@/api/resident"

export default {
  name: "EditInfo",

  data() {
    return {
      editInfo: true,
      residentData: null,
      // device: null, 
      // info: null,
      // health: null,
      // bedNumber: null,
    };
  },
  created(){
      this.fetchResident();
  },

  methods: {
    fetchResident() {
        getResidentInfo("60b5e450d9ddc5d631dc9ece").then((response)=> {
            // this.info = response.data.info;
            // this.device = response.data.device;
            // this.health = response.data.health;
            // this.bedNumber = response.data.bedNumber;
            this.residentData = response.data;
            console.log("bed number: " + residentData.bedNumber);
            
        });
    },
     cancelEditPage(){
      this.$router.push({ path: this.redirect || "/infomation/index", query:{ residentId: this.residentData.device._id }});
      console.log("cancel edit");
    },
    confirmEdit(){

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

