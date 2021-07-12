<template>
  <!-- <div class="device-wrapper"> -->
  <el-card
    id="card"
    v-bind:class="[isConnected ? 'device-card' : 'device-card card-disconnect']"
    :body-style="{ padding: '0px' }"
  >
    <div
      v-bind:class="[
        isConnected ? 'card-title' : 'card-title title-disconnect',
      ]"
    >
      <span
        v-if="
          (device.vitalSigns.spo2 != undefined) &
          (device.vitalSigns.spo2 < spo2_thr)
        "
      >
        <svg-icon icon-class="warning" class-name="icon-warning" />
      </span>
      <span v-if="device.resident">{{ device.resident.bedNumber }} - </span>
      <span v-else>Bed #</span>

      <span v-if="device.resident">{{ device.resident.info.name }}</span>

      <i class="el-icon-info" style="float: right" @click="goToInfoPage" />
      <i class="el-icon-delete" style="float: right" @click="deleteDevice" />
    </div>

    <!-- <div class="name" v-if="device.resident">{{ device.resident.info.name }}</div>
    <div class="name" v-else>Resident</div> -->
    <div class="icon-thor" @click="goRecordPage">
      <svg-icon icon-class="thor" />
    </div>

    <div class="device-name">{{ device.name }}</div>
    <!-- <div class="icon-people">
      <svg-icon icon-class="people"/>
    </div> -->
    <el-row>
      <el-col class="test" :span="18">
        <div class="text">
          <svg-icon icon-class="cardiogram" class-name="card-panel-icon" />
          <span>心率</span>
          <span style="float: right"
            >{{ device.vitalSigns.hr }}
            <span style="color: gray">BPM</span>
          </span>
        </div>

        <div class="text">
          <div class="icon-temp">
            <svg-icon icon-class="celsius" class-name="card-panel-icon" />
          </div>
          <span>體溫</span>
          <span style="float: right"
            >{{ Math.round(device.vitalSigns.temp * 10) / 10 }}
            <span style="color: gray">℃</span>
          </span>
        </div>

        <div class="text">
          <svg-icon icon-class="oxygen" class-name="card-panel-icon" />

          <span
            v-if="
              (device.vitalSigns.spo2 != undefined) &
              (device.vitalSigns.spo2 < spo2_thr)
            "
            class="spo2-enhance"
            >血氧濃度</span
          >
          <span v-else>血氧濃度</span>

          <span
            v-if="
              (device.vitalSigns.spo2 != undefined) &
              (device.vitalSigns.spo2 < spo2_thr)
            "
            style="float: right"
            class="spo2-enhance"
            >{{ device.vitalSigns.spo2 }}
            <span style="color: gray">％</span>
          </span>
          <span v-else style="float: right"
            >{{ device.vitalSigns.spo2 }}
            <span style="color: gray">％</span>
          </span>
        </div>
        <div class="text">
          <div class="icon-pi">
            <svg-icon icon-class="perfusion" class-name="card-panel-icon" />
          </div>
          <span>灌注指標</span>
          <span style="float: right"
            >{{ Math.round(device.vitalSigns.pi * 100) / 100 }}
            <span style="color: gray">％</span>
          </span>
        </div>

        <!-- <div class="text">
          <div class="icon-pi">
            <svg-icon icon-class="blood-pressure" class-name="card-panel-icon" />
          </div>
          <span>血壓</span>
          <span style="float: right" >{{ }}/{{ }}</span>
        </div> -->
      </el-col>
      <el-col :span="6">
        <div v-if="this.device.isConnected">
          <svg-icon icon-class="user" class-name="connect-panel" />
        </div>
        <div v-else>
          <svg-icon icon-class="no-wifi" class-name="connect-panel" />
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { crono } from "vue-crono";
export default {
  name: "Device",
  data() {
    return {
      spo2_thr: 90,
      isConnected: this.device.isConnected,
    };
  },
  props: {
    device: {
      type: Object,
      default: null,
      required: true,
    },
  },
  methods: {
    goToInfoPage() {
      if (this.device.resident) {
        this.$router.push({
          path: this.redirect || "/infomation/index",
          query: { residentId: this.device.resident._id },
        });
      }
    },
    goRecordPage() {
      // if (this.device.isConnected){
      this.$router.push({
        path: this.redirect || "/chart/index",
        query: { residentId: this.device.resident._id },
      });
      // this.$router.push({ name: this.redirect || "/chart/index", params: { residentId: this.device.resident._id }});
      console.log(this.device._id);
      // }
    },
    deleteDevice() {
      this.$emit("delete-device", {
        id: this.device.id,
        name: this.device.name,
      });
    },
  },
};
</script>

<style scoped>
.device-card {
  border: 2px solid;
  border-radius: 10px;
}
.device-card.card-disconnect {
  color: gray;
}

.card-title {
  padding: 10px;
  background-color: black;
  color: white;
  font-size: 24px;
}

.card-title.title-disconnect {
  background-color: gray;
}

.device-name {
  padding: 10px;
  border-bottom: 1px black solid;
  font-size: 24px;
}

.icon-thor {
  float: left;
  font-size: 36px;
}

.text {
  padding: 10px;
  font-size: 24px;
}
.test {
  border-right: 1px black solid;
}

.card-panel-icon {
  float: left;
  font-size: 30px;
}
.icon-warning {
  float: left;
  font-size: 30px;
  color: yellow;
}
.icon-temp {
  color: #36a3f7;
}
.icon-pi {
  color: #34bfa3;
}
.spo2-enhance {
  color: red;
}

.icon-people {
  color: #36a3f7;
  float: right;
  font-size: 36px;
}

.connect-panel {
  color: #36a3f7;
  margin-top: 64px;
  margin-left: 10px;
  padding: 3px 3px;
  font-size: 82px;
}

.icon-thor:hover {
  color: #36a3f7;
}
</style>
