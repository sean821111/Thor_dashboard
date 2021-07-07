<template>
  <!-- <div class="device-wrapper"> -->
  <el-card id="card" v-bind:class="[activeDevice.isConnected ? 'device-card':'device-card card-disconnect']" :body-style="{ padding: '0px' }">
    <div v-bind:class="[activeDevice.isConnected? 'card-title':'card-title title-disconnect']">
      <span v-if="activeDevice.vitalSigns.spo2 != NONE & activeDevice.vitalSigns.spo2 < SPO2_THRESH">
        <svg-icon icon-class="warning" class-name="icon-warning" />
      </span>
      <span v-if="resident">{{ resident.bedNumber }}  {{ resident.info.name }}</span>
      <span v-else>Bed #</span>

      <i class="el-icon-info" style="float: right" @click="goToInfoPage" />
      <i class="el-icon-delete" style="float: right" v-permission="['admin']" @click="deleteResident" />
    </div>

    <!-- <div class="name" v-if="device.resident">{{ device.resident.info.name }}</div>
    <div class="name" v-else>Resident</div> -->
    <!-- <div class="icon-thor" @click="goRecordPage">
      <svg-icon icon-class="thor"/>
    </div> -->
    
    <div class="device-name">
      <div v-bind:class="[(activeDeviceIndex == 0) ? 'active' : 'inactive']">
        Thor 1: {{ (resident.thorDevices.length > 0) ? resident.thorDevices[0].name : 'null' }}
      </div>
      <div v-bind:class="[(activeDeviceIndex == 1) ? 'active' : 'inactive']">
        Thor 2: {{ (resident.thorDevices.length > 1) ? resident.thorDevices[1].name : 'null' }}
      </div>
    </div>
    <!-- <div class="icon-people">
      <svg-icon icon-class="people"/>
    </div> -->
    <el-row>
      <el-col class="test" :span="18">
         <div class="text">
          <svg-icon icon-class="cardiogram" class-name="card-panel-icon" />
          <span>心率</span>
          <span style="float: right">
            {{ (activeDevice.vitalSigns.hr == NONE) ? '----' : activeDevice.vitalSigns.hr }} BPM
          </span>
        </div >
        
        <div class="text">
          <div class="icon-temp">
            <svg-icon icon-class="celsius" class-name="card-panel-icon" />
          </div>
          <span>體溫</span>
          <span style="float: right">
            {{ (activeDevice.vitalSigns.temp == NONE) ? '----' : Math.round(activeDevice.vitalSigns.temp * 10) / 10 }} ℃
          </span>
        </div>

        <div class="text">
          <svg-icon icon-class="oxygen" class-name="card-panel-icon" />
          
          <div v-bind:class="[(activeDevice.vitalSigns.spo2 != NONE && activeDevice.vitalSigns.spo2 < SPO2_THRESH) ? 'spo2-enhance' : '']">
            <span>血氧濃度</span>
            <span style="float: right">
              {{ (activeDevice.vitalSigns.spo2 == NONE) ? '----' : activeDevice.vitalSigns.spo2 }} ％
            </span>    
          </div>
        </div>
        <div class="text">
          <div class="icon-pi">
            <svg-icon icon-class="perfusion" class-name="card-panel-icon" />
          </div>
          <span>灌注指標</span>
          <span style="float: right" >
            {{ (activeDevice.vitalSigns.pi == NONE) ? '----' : Math.round(activeDevice.vitalSigns.pi * 100) / 100 }} ％
          </span>
        </div>

        <div class="text">
          <div class="icon-pi">
            <svg-icon icon-class="blood-pressure" class-name="card-panel-icon" />
          </div>
          <span>血壓</span>
          <span style="float: right" >{{ }}/{{ }}</span>
        </div>
        
      </el-col>
      <el-col :span="6">
        <div v-if="activeDevice.isConnected">
          <svg-icon icon-class="user" class-name="connect-panel" />
        </div>
        <div v-else>
           <svg-icon icon-class="disconnected" class-name="connect-panel" />
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { crono } from 'vue-crono'

export default {
  name: "Resident",
  data(){
    return{
      NONE: -1,
      SPO2_THRESH: 90,
      isConnected: true,
      initVitalSigns: null,
      activeDevice: {
        vitalSigns: null,
        name: null,
        address: null,
        isConnected: false,
      },
      activeDeviceIndex: null
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
      pi: this.NONE
    }
    this.activeDevice.vitalSigns = this.initVitalSigns;
    this.resetActiveDevice();
  },
  methods: {
    resetActiveDevice() {
      console.log("resetActiveDevice");
      this.activeDeviceIndex = this.NONE;
      for(var i = 0; i < this.resident.thorDevices.length; i++) {
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
    },
    goToInfoPage() {
      //if (this.device.resident) {
        this.$router.push({ path: this.redirect || "/infomation/index", query:{ residentId: this.resident._id }});
      //}
    },
    // goRecordPage(){
      
    //   if (this.device.isConnected){
    //     this.$router.push({ path: this.redirect || "/chart/index", query:{ deviceName: this.device.name }, params: { residentId: this.device.resident._id }});
    //     console.log(this.device._id)
    //   }
      
    // },
    deleteResident() {
      this.$emit("delete-resident", {
        id: this.resident._id,
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
.device-card.card-disconnect{
  color:gray;
}

.card-title {
  padding: 10px;
  background-color: black;
  color: white;
  font-size: 24px;
}

.card-title.title-disconnect{
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
  color:gray;
}

.icon-thor{
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
.icon-warning{
  float: left;
  font-size: 30px;
  color:yellow;
}
.icon-temp {
  color: #36a3f7;
}
 .icon-pi {
  color: #34bfa3
}
.spo2-enhance{
  color:red;
}

.icon-people{
  color: #36a3f7;
  float: right;
  font-size: 36px;
}


.connect-panel{
  color: #36a3f7;
  margin-top: 64px;
  margin-left: 10px;
  padding: 3px 3px;
  font-size: 82px;
}

.icon-thor:hover{
  color: #36a3f7;
}


</style>
