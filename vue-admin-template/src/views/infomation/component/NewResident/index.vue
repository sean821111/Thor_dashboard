<template>
  <div class="app-container">
    <div class="info-container">
      <el-form
        class="resident-info"
        ref="form"
        :rules="rules"
        :model="form"
        label-width="120px"
        size="35"
      >
        <el-row>
          <span style="float: left">
            <h1>住民資訊新增</h1>
          </span>
          <span style="float: right">
            <el-form-item>
              <el-button type="success" @click="save">儲存</el-button>
              <el-button type="warning" @click="cancel">取消</el-button>
            </el-form-item>
          </span>
        </el-row>
        <el-row :gutter="30">
          <el-col :span="6">
            <h2>住民資訊</h2>
          </el-col>
          <el-col :span="6">
            <h2>住民身體狀況</h2>
          </el-col>
          <el-col :span="6">
            <h2>裝置資訊</h2>
          </el-col>
        </el-row>

        <el-row :gutter="30">
          <el-col :span="6">
            <el-form-item label="姓名：" prop="info.name">
              <el-input
                v-model="form.info.name"
                style="width: 100px"
              ></el-input>
            </el-form-item>
            <el-form-item label="性別：">
              <div class="grid-content">
                <el-radio v-model="form.info.gender" label="M">男</el-radio>
                <el-radio v-model="form.info.gender" label="F">女</el-radio>
              </div>
            </el-form-item>

            <el-form-item label="身份證字號:" prop="info.idNumber">
              <el-input
                v-model="form.info.idNumber"
                style="width: 150px"
              ></el-input>
            </el-form-item>

            <el-form-item label="身高:">
              <el-input
                v-model="form.info.height"
                style="width: 80px"
              ></el-input>
            </el-form-item>

            <el-form-item label="體重:">
              <el-input
                v-model="form.info.weight"
                style="width: 80px"
              ></el-input>
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
              <el-input type="textarea" v-model="form.health"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="床號：" prop="bedNumber">
              <el-input v-model="form.bedNumber"></el-input>
            </el-form-item>

            <el-form-item label="Thor裝置1：">
              <el-select v-model="form.thorDeviceNames[0]" placeholder="Select">
                <el-option
                  v-for="deviceName in validThorDeviceNames"
                  :key="deviceName"
                  :value="deviceName"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Thor裝置2：">
              <el-select v-model="form.thorDeviceNames[1]" placeholder="Select">
                <el-option
                  v-for="deviceName in validThorDeviceNames"
                  :key="deviceName"
                  :value="deviceName"
                >
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
    const validateIdNumber = (rule, value, callback) => {
      console.log("validateIdNumber");
      let id = value.trim();
      let verification = id.match("^[A-Z][12]\\d{8}$");
      if (!verification) {
        callback(new Error("身份證字號錯誤"));
      } else {
        let conver = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
        let weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

        id = String(conver.indexOf(id[0]) + 10) + id.slice(1);

        let checkSum = 0;
        for (let i = 0; i < id.length; i++) {
          let c = parseInt(id[i]);
          let w = weights[i];
          checkSum += c * w;
        }
        if (checkSum % 10 == 0) {
          callback();
        } else {
          callback(new Error("檢核碼錯誤"));
        }
      }
    };
    const validateNumber = (rule, value, callback) => {
      if (typeof value != "number") callback(new Error("非數字"));
    };
    return {
      form: {
        info: {
          name: "",
          gender: "",
          idNumber: "",
          height: "",
          weight: "",
          birthday: "",
        },
        health: "",
        bedNumber: "",
        remark: null,
        thorDeviceNames: ["null", "null"],
        pairsDeviceName: null,
      },
      validThorDeviceNames: ["null"],
      validPairsDevices: ["null"],
      rules: {
        "info.name": [
          { required: true, message: "請輸入姓名", trigger: "blur" },
        ],
        "info.idNumber": [
          { required: true, message: "請輸入身份證字號", trigger: "blur" },
          { validator: validateIdNumber, trigger: "blur" },
        ],
        bedNumber: [{ required: true, message: "請輸入床號", trigger: "blur" }],
      },
    };
  },
  created() {
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
        console.log(
          "this.validThorDeviceNames: " +
            JSON.stringify(this.validThorDeviceNames)
        );
      });
    },
    cancel() {
      console.log("cancel");
      this.$router.push({ path: this.redirect || "/dashboard" });
    },
    save() {
      console.log("save");
      this.form.thorDeviceNames = this.form.thorDeviceNames.filter(
        (deviceName) => deviceName !== "null"
      );
      console.log("form: " + JSON.stringify(this.form));
      this.$refs["form"].validate((valid) => {
        if (valid) {
          addResident(this.form).then((response) => {
            console.log("response: " + JSON.stringify(response));
            this.$router.push({ path: this.redirect || "/dashboard" });
          });
          this.$message({
            message: "新增住民成功",
            type: "success",
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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
.el-col {
  column-gap: 40px;
}
</style>

