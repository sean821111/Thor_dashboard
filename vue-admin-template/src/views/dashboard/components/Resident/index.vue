<template>
  <!-- <div class="device-wrapper"> -->
  <el-card
    id="card"
    v-bind:class="[
      activeDevice.isConnected ||
      (resident.pairsDevice != null && resident.pairsDevice.isConnected)
        ? 'device-card'
        : 'device-card card-disconnect',
    ]"
    :body-style="{ padding: '0px' }"
  >
    <div
      v-bind:class="[
        activeDevice.isConnected ||
        (resident.pairsDevice != null && resident.pairsDevice.isConnected)
          ? 'card-title'
          : 'card-title title-disconnect',
      ]"
    >
      <span
        v-if="
          (activeDevice.vitalSigns.temp != NONE && activeDevice.vitalSigns.temp > resident.vitalSignsThresh.temp) ||
          (activeDevice.vitalSigns.spo2 != NONE && activeDevice.vitalSigns.spo2 < resident.vitalSignsThresh.spo2)
        "
      >
        <svg-icon icon-class="warning" class-name="icon-warning" />
      </span>

      <el-button type="info" @click="goToInfoPage">
        <span v-if="resident" style="font-size: 16px"
          >{{ resident.bedNumber }} {{ resident.info.name }}</span
        >
        <span v-else style="font-size: 16px">無床號 #</span>
      </el-button>

      <button
        class="delete-btn"
        @click="deleteResident"
        style="float: right; padding: 6px 6px 0"
        v-permission="['admin']"
      >
        <i class="el-icon-delete" />
      </button>
      <confirm-dialogue ref="confirmDialogue"></confirm-dialogue>
    </div>

    <!-- <div class="name" v-if="device.resident">{{ device.resident.info.name }}</div>
    <div class="name" v-else>Resident</div> -->
    <!-- <div class="icon-thor" @click="goRecordPage">
      <svg-icon icon-class="thor"/>
    </div> -->

    <div class="device-name">
      <div v-bind:class="[activeDeviceIndex == 0 ? 'active' : 'inactive']">
        Thor 1:
        {{
          resident.thorDevices.length > 0 ? resident.thorDevices[0].name : "無"
        }}
        {{
          resident.thorDevices.length > 0 && resident.thorDevices[0].battery > 0
            ? resident.thorDevices[0].battery + "%"
            : ""
        }}
      </div>
      <div v-bind:class="[activeDeviceIndex == 1 ? 'active' : 'inactive']">
        Thor 2:
        {{
          resident.thorDevices.length > 1 ? resident.thorDevices[1].name : "無"
        }}
        {{
          resident.thorDevices.length > 1 && resident.thorDevices[1].battery > 0
            ? resident.thorDevices[1].battery + "%"
            : ""
        }}
      </div>
      <div
        v-bind:class="[
          resident.pairsDevice != null && resident.pairsDevice.isConnected
            ? 'active'
            : 'inactive',
        ]"
      >
        Paris:
        {{ resident.pairsDevice != null ? resident.pairsDevice.name : "無" }}
        {{
          resident.pairsDevice != null && resident.pairsDevice.battery > 0
            ? resident.pairsDevice.battery + "%"
            : ""
        }}
      </div>
    </div>

    <el-row>
      <el-col class="test" :span="18">
        <div class="text">
          <svg-icon icon-class="cardiogram" class-name="card-panel-icon" />
          <span>心率</span>
          <span style="float: right">
            {{
              activeDevice.vitalSigns.hr == NONE
                ? "----"
                : activeDevice.vitalSigns.hr
            }}
            BPM
          </span>
        </div>

        <div class="text">
          <div class="icon-temp">
            <svg-icon icon-class="celsius" class-name="card-panel-icon" />
          </div>
          <div
            v-bind:class="{ 'temp-enhance':
              activeDevice.vitalSigns.temp != NONE &&
              activeDevice.vitalSigns.temp > resident.vitalSignsThresh.temp
            }"
          >
            <span>體溫</span>
            <span style="float: right">
              {{
                activeDevice.vitalSigns.temp == NONE
                  ? "----"
                  : Math.round(activeDevice.vitalSigns.temp * 10) / 10
              }}
              ℃
            </span>
          </div>
        </div>

        <div class="text">
          <svg-icon icon-class="oxygen" class-name="card-panel-icon" />

          <div
            v-bind:class="{ 'spo2-enhance':
              activeDevice.vitalSigns.spo2 != NONE &&
              activeDevice.vitalSigns.spo2 < resident.vitalSignsThresh.spo2
            }"
          >
            <span>血氧濃度</span>
            <span style="float: right">
              {{
                activeDevice.vitalSigns.spo2 == NONE
                  ? "----"
                  : activeDevice.vitalSigns.spo2
              }}
              ％
            </span>
          </div>
        </div>
        <div class="text">
          <div class="icon-pi">
            <svg-icon icon-class="perfusion" class-name="card-panel-icon" />
          </div>
          <span>灌注指標</span>
          <span style="float: right">
            {{
              activeDevice.vitalSigns.pi == NONE
                ? "----"
                : Math.round(activeDevice.vitalSigns.pi * 100) / 100
            }}
            ％
          </span>
        </div>

        <div class="text">
          <svg-icon icon-class="sleep_event" class-name="card-panel-icon" />
          <span>睡眠事件</span>
          <span style="float: right">
            {{
              resident.pairsDevice == null ||
              resident.pairsDevice.sleepEvent.event == NONE
                ? "----"
                : eventToString(resident.pairsDevice.sleepEvent.event)
            }}
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
      <el-col :span="5">
        <!-- <div
          v-if="activeDevice.isConnected && activeDevice.vitalSigns.hr == -1"
        >
          <svg-icon icon-class="ble_connected" class-name="icon-wrapper" />
        </div> -->
        <div
          v-if="activeDevice.isConnected && activeDevice.vitalSigns.hr == NONE"
        >
          <svg-icon icon-class="thor_connected2" class-name="icon-wrapper" />
          <!-- <app-icon name="user" size="l" fill></app-icon> -->
        </div>
        <div
          v-else-if="
            activeDevice.isConnected && activeDevice.vitalSigns.hr != NONE
          "
        >
          <svg-icon icon-class="thor_connected" class-name="icon-wrapper" />
        </div>
        <div v-else>
          <svg-icon icon-class="thor_unbind" class-name="icon-wrapper" />
        </div>

        <div
          v-if="
            resident.pairsDevice != null && resident.pairsDevice.isConnected
          "
        >
          <svg-icon icon-class="sleep" class-name="icon-wrapper" />
        </div>
        <div v-else>
          <svg-icon
            icon-class="offbed"
            class-name="disconnected-icon-wrapper"
          />
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import ConfirmDialogue from "../ConfirmDialogue.vue";
// import AppIcon from "./components/AppIcon";

export default {
  name: "Resident",
  components: { ConfirmDialogue },
  data() {
    return {
      NONE: -1,
      SPO2_THRESH: 90,
      isConnected: true,
      battery: -1,
      initVitalSigns: null,
      activeDevice: {
        vitalSigns: null,
        name: null,
        address: null,
        isConnected: false,
      },
      activeDeviceIndex: null,
      initSleepEvent: null,
    };
  },
  props: {
    resident: {
      type: Object,
      default: null,
      required: true,
    },
  },
  created() {
    this.initVitalSigns = {
      temp: this.NONE,
      hr: this.NONE,
      spo2: this.NONE,
      pi: this.NONE,
    };
    this.initSleepEvent = {
      timestamp: null,
      event: this.NONE,
    };
    this.activeDevice.vitalSigns = this.initVitalSigns;
    if (this.resident.pairsDevice) {
      this.resident.pairsDevice.sleepEvent = this.initSleepEvent;
    }
    this.resetActiveDevice();
  },
  methods: {
    async deleteResident() {
      const ok = await this.$refs.confirmDialogue.show({
        title: "刪除住民",
        message: "確定刪除該住民嗎？刪除後將無法復原。",
        okButton: "刪除",
      });
      // If you throw an error, the method will terminate here unless you surround it wil try/catch
      if (ok) {
        this.$message({
          message: "成功刪除住民",
          type: "warning",
        });
        // alert("成功刪除住民！");
        this.$emit("delete-resident", {
          id: this.resident._id,
        });
      }
    },
    resetActiveDevice() {
      console.log("resetActiveDevice");
      this.activeDeviceIndex = this.NONE;

      for (var i = 0; i < this.resident.thorDevices.length; i++) {
        if (this.resident.thorDevices[i].isConnected) {
          this.activeDevice = this.resident.thorDevices[i];
          this.activeDeviceIndex = i;
          break;
        }
      }
    },
    getActiveDeviceIndex() {
      return this.activeDeviceIndex;
    },
    clearVitalSigns(index) {
      console.log("clearVitalSigns");
      this.resident.thorDevices[index].vitalSigns = this.initVitalSigns;
      this.resident.thorDevices[index].battery = this.NONE;
    },
    clearSleepEvent() {
      console.log("clearSleepEvent");
      this.resident.pairsDevice.sleepEvent = this.initSleepEvent;
      this.resident.pairsDevice.battery = this.NONE;
    },
    eventToString(event) {
      switch (event) {
        case 0:
          return "進床";
        case 1:
          return "離床";
        case 2:
          return "翻身";
      }
    },
    goToInfoPage() {
      //if (this.device.resident) {
      this.$router.push({
        path: this.redirect || "/infomation/index",
        query: { residentId: this.resident._id },
      });
      //}
    },
    // goRecordPage(){

    //   if (this.device.isConnected){
    //     this.$router.push({ path: this.redirect || "/chart/index", query:{ deviceName: this.device.name }, params: { residentId: this.device.resident._id }});
    //     console.log(this.device._id)
    //   }

    // },
    // deleteResident() {
    //   this.$emit("delete-resident", {
    //     id: this.resident._id,
    //   });
    // },
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

.active {
  color: black;
}
.inactive {
  color: gray;
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
.spo2-enhance, .temp-enhance {
  color: red;
}

.icon-thor:hover {
  color: #36a3f7;
}

.delete-btn {
  padding: 0.5em 1em;
  background-color: #eccfc9;
  color: #c5391a;
  border: 2px solid #ea3f1b;
  border-radius: 5px;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  cursor: pointer;
}
.icon-wrapper {
  color: #36a3f7;
  height: 5em;
  width: 4em;
  margin-top: 5px;
  margin-left: 10px;
}

.disconnected-icon-wrapper {
  color: gray;

  height: 5em;
  width: 4em;
  margin-top: 5px;
  margin-left: 10px;
}
</style>
