<template>
  <div margin-width="25%" class="dashboard-editor-container">
    <el-row>
      <el-col :span="12">
        <el-row>
          <div class="block_container">
            <h1>{{ this.bedNum }}床壓力分佈圖</h1>

            <el-radio-group class="mode_container" v-model="mode" @change="clearHeatmap">
              <el-radio-button label="real_time">即時</el-radio-button>
              <el-radio-button label="history">歷史</el-radio-button>
            </el-radio-group>
          </div>
        </el-row>
        <el-row>
          <div id="heatmap" class="heatmapjs-container">
            <img src="../../../assets/bed.png" />
          </div>
          <el-row v-if="selectedRecordTimestamp != 0" style="margin-top: 20px" gutter="20">
            <el-col :span="2">
              <el-button v-if="playing" icon="el-icon-video-pause" circle @click="pauseHeatmapRecord"></el-button>
              <el-button v-else icon="el-icon-video-play" circle @click="playHeatmapRecord"></el-button>
            </el-col>
            <el-col :span="18">
              <el-slider
                
                v-model="sliderValue"
                :step="1"
                :min="0"
                :max="21"
                :format-tooltip="formatTooltip"
                @input="changeHeatmap"
                >
              </el-slider>
            </el-col>
          </el-row>
        </el-row>
        <el-row>
        </el-row>
      </el-col>
      <el-col :span="12">
        <turn-over-record v-if="mode == 'history'" :residentId="residentId" @selected-record="handleSelectedRecord"/>
      </el-col>
    </el-row>
    
    <el-row style="margin-bottom: 32px">
      <!-- <el-col :span="10" :xs="18" :sm="15" :lg="10"> -->
    </el-row>
  </div>
</template>


<script>
import Heatmap from "heatmap.js";
import { getResidentInfo, getResidentSleepRecord, getResidentTurnOverRecord } from "@/api/resident";
import RadialBar from "./RadialBar";
import TurnOverRecord from "./TurnOverRecord";
import { parseTime } from "@/utils";
// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

export default {
  name: "Heatmap",
  components: {
    RadialBar,
    TurnOverRecord
  },
  data() {
    return {
      bedNum: "",
      deviceName: null,
      radialChartTitle: "睡眠品質",
      sleepQuality: 77,
      pressureData: null, // raw data
      points: [], // heatmap data list
      cavWidth: null, //获取宽度
      cavHeight: null, //获取高度
      heatmapInstance: null,
      sliderValue: 0,
      selectedRecordTimestamp: 0,
      selectedRawDataRecords: [],
      mode: "real_time",
      playing: false,
    };
  },
  sse: {
    cleanup: true,
  },
  props: {
    residentId: {
      type: String,
      required: true,
    },
  },
  created() {
    this.getResident();
    // this.initValue();
  },
  watch: {},
  mounted() {
    sseClient = this.$sse.create({
      url: process.env.VUE_APP_BASE_API + "/device/update",
      format: "json",
      polyfill: true,
      withCredentials: false,
    });

    // Catch any errors (ie. lost connections, etc.)
    sseClient.on("error", (e) => {
      console.error("lost connection or failed to parse!", e);

      // If this error is due to an unexpected disconnection, EventSource will
      // automatically attempt to reconnect indefinitely. You will _not_ need to
      // re-add your handlers.
    });

    // Handle messages without a specific event
    sseClient.on("message", this.handleMessage);

    sseClient
      .connect()
      .then((sse) => {
        console.log("We're connected!");

        // Unsubscribes from event-less messages after 7 seconds
        // setTimeout(() => {
        //   sseClient.off('UPDATE_DEIVCE', this.handleMessage);
        //   console.log('Stopped listening to event-less messages!');
        // }, 7000);
      })
      .catch((err) => {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error("Failed to connect to server", err);
      });

    this.initData();
  },
  methods: {
    getResident() {
      getResidentInfo(this.residentId).then((response) => {
        this.bedNum = response.data.bedNumber;
        this.deviceName = response.data.pairsDevice.name;
        console.log("get resiednt bedNum : " + this.bedNum);
      });
    },
    initData() {
      this.heatmapInstance = Heatmap.create({
        container: document.getElementById("heatmap"),
        radius: 50,
        blur: 0.7,
      });
      var points = [];
      var offset = 160;
      getResidentInfo(this.residentId).then((response) => {
        if (response.data.pairsDevice != null) {
          this.pressureData = response.data.pairsDevice.rawData;
          // Mock data, maximum value is 2.5
          // this.pressureData = [
          // 1, 2, 1, 1, 2, 0, 5, 1, 1, 1.4, 1.4, 1.4, 2.5, 2, 0.5,
          // ];
          for (var i = 2; i > -1; i--) {
            for (var j = 0; j < 5; j++) {
              var index = i * 5 + j;

              var point = {
                x: (j + 1) * 70 + offset,
                y: (i + 1) * 80,
                value: this.pressureData[index] * 100,
              };
              points.push(point);
            }
          }

          var heatmapData = {
            max: 250,
            min: 0,
            data: points,
          };
          // 因为data是一组数据,web切图报价所以直接setData
          this.heatmapInstance.setData(heatmapData);
        }
      });
    },
    setHeatmap(data) {
      var points = [];
      var index = 0;
      var offset = 160;
      for (var i = 2; i > -1; i--) {
        for (var j = 0; j < 5; j++) {
          var point = {
            x: (j + 1) * 70 + offset,
            y: (i + 1) * 80,
            value: data[index] * 100,
          };
          points.push(point);
          index += 1;
        }
      }

      var heatmapData = {
        max: 250,
        min: 0,
        data: points,
      };
      // // 因为data是一组数据,web切图报价所以直接setData
      // this.heatmapInstance.repaint();
      this.heatmapInstance.setData(heatmapData);
    },
    getList() {
      this.listLoading = true;
      this.listData = [];
      console.log(
        "start~end:" +
          this.residentId +
          ":" +
          this.recordStart +
          "~" +
          this.recordEnd
      );
      //simulate with fake data
      // this.listData = listData;
      getResidentSleepRecord(
        this.residentId,
        this.recordStart,
        this.recordEnd
      ).then((response) => {
        this.list = response.data;
        this.total += 1;
        // this.total = response.data.total;

        // Just to simulate the time of the request
        // setTimeout(() => {
        //   this.listLoading = false;
        // }, 1.5 * 1000);
      });
    },
    formatTooltip(val) {
      let halfLength = this.selectedRawDataRecords.length / 2;
      let timestamp = this.selectedRecordTimestamp + ((val - halfLength) * 1000);
      console.log("timestamp " + timestamp);
      let time = parseTime(timestamp);
      console.log("time " + time);
      return time;
    },
    handleSelectedRecord(timestamp) {
      this.clearHeatmap();
      this.selectedRecordTimestamp = timestamp;
      getResidentTurnOverRecord(timestamp).then((response) => {
        this.selectedRawDataRecords = response.data;
        this.setHeatmap(this.selectedRawDataRecords[0]);
      });
    },
    changeHeatmap(val) {
      this.setHeatmap(this.selectedRawDataRecords[val]);
    },
    timer() {
      this.time = setInterval(() => {
        if (this.sliderValue == this.selectedRawDataRecords.length) {
          this.playing = false;
          this.sliderValue = 0;
          this.stopTimer();
        } else {
          this.sliderValue += 1;
        }
      }, 1000)
    },
    startTimer() {
      this.timer()
    },
    stopTimer() {
      if (this.time) {
        clearInterval(this.time)
      }
    },
    playHeatmapRecord() {
      this.playing = true;
      this.startTimer();
    },
    pauseHeatmapRecord() {
      this.playing = false;
      this.stopTimer();
    },
    handleMessage(message) {
      console.warn("Received a message w/o an event!", message);
      if (message != "initial") {
        // console.log("Received a json");
        JSON.parse(JSON.stringify(message));

        if (this.deviceName === message.name) {
          if ("rawData" in message) {
            // console.log("rawData");
            if (this.mode == 'real_time') {
              this.setHeatmap(message.rawData);
            }
            // result.device.rawData = message.rawData;
          }
        }
      }
    },
    clearHeatmap() {
      this.selectedRecordTimestamp = 0;
      this.selectedRawDataRecords = [];
      this.setHeatmap(Array(15).fill(0));
      this.playing = false;
      this.sliderValue = 0;
      this.stopTimer();
    }
  },
};
</script>

<style scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
}

.block_container {
  display: flex;
}

.mode_container {
  margin-top: 20px;
  margin-left: 20px;
}

.div {
  width: 600px;
  height: 600px;
  border: 1px solid;
  border-color: gray;
}
/* .heatmapjs-container {
  width: 520px;
  height: 320px;
  background-color: antiquewhite;
  margin-left: 5%;
  border-left: 40px solid rgb(231, 186, 127);
  border-color: rgba(0, 0, 0, 0.05);
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.5);
} */
.heatmapjs-container {
  height: 300px;
  width: 620px;
}
.radial-bar-wrapper {
  margin-left: 5%;
}
.card-panel-icon-wrapper {
  color: #fff;

  float: left;
  margin: 14px 0 0 14px;
  padding: 16px;
  transition: all 0.38s ease-out;
  border-radius: 6px;
}

.card-panel {
  height: 108px;
  font-size: 12px;
  position: relative;
  overflow: hidden;
  color: #666;
  background: #fff;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.05);
}
.card-panel-icon {
  float: left;
  font-size: 48px;
  color: #36a3f7;
}
.card-panel-text {
  float: right;
  font-weight: bold;
  margin: 26px;
  margin-left: 0px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 20px;
  margin-bottom: 12px;
}
.card-panel-content {
  font-size: 24px;
  float: right;
  font-weight: bold;
  margin: 26px;
  margin-left: 0px;
}
.header-container {
  color: white;
  background-color: grey;
  min-height: 50px;
  border-radius: 4px;
}
.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
  padding: 8px;
}
</style>
