<template>
  <div margin-width="25%" class="dashboard-editor-container">
    <h1>{{ this.bedNum }}床壓力分佈圖</h1>

    <el-row style="margin-bottom: 32px">
      <el-col :xs="18" :sm="15" :lg="10">
        <div id="heatmap" class="heatmapjs-container"></div>
      </el-col>
      <!-- <el-col :xs="5" :sm="5" :lg="5">
        <radial-bar
          :chart-title="radialChartTitle"
          :chart-value="sleepQuality"
        />
      </el-col> -->
    </el-row>
    <!-- <el-row :gutter="24">
      <el-col :xs="4" :sm="4" :lg="4">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper">
            <svg-icon icon-class="sleep" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">進床</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="4" :sm="4" :lg="4">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper">
            <svg-icon icon-class="offbed" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">離床</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="4" :sm="4" :lg="4">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper">
            <svg-icon icon-class="user" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">翻身</div>
          </div>
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>


<script>
import Heatmap from "heatmap.js";
import { getResidentInfo, getResidentSleepRecord } from "@/api/resident";
import RadialBar from "./RadialBar";
// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

export default {
  name: "Heatmap",
  components: {
    RadialBar,
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
        radius: 70,
        blur: 0.7,
      });
      var points = [];

      getResidentInfo(this.residentId).then((response) => {
        if (response.data.pairsDevice != null) {
          this.pressureData = response.data.pairsDevice.rawData;
          // Mock data, maximum value is 2.5
          // this.pressureData = [
          //   1, 2, 1, 1, 2, 0, 5, 1, 1, 1.4, 1.4, 1.4, 2.5, 0, 0.5,
          // ];
          for (var i = 2; i > -1; i--) {
            for (var j = 0; j < 5; j++) {
              var index = i * 5 + j;

              var point = {
                x: (j + 1) * 80,
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

      for (var i = 2; i > -1; i--) {
        for (var j = 0; j < 5; j++) {
          var point = {
            x: (j + 1) * 80,
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
    handleMessage(message) {
      console.warn("Received a message w/o an event!", message);
      if (message != "initial") {
        // console.log("Received a json");
        JSON.parse(JSON.stringify(message));

        if (this.deviceName === message.name) {
          if ("rawData" in message) {
            // console.log("rawData");
            this.setHeatmap(message.rawData);
            // result.device.rawData = message.rawData;
          }
        }
      }
    },
  },
};
</script>

 <style scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
}

.div {
  width: 600px;
  height: 600px;
  border: 1px solid;
  border-color: gray;
}
.heatmapjs-container {
  width: 520px;
  height: 320px;
  background-color: antiquewhite;
  margin-left: 5%;
  border-left: 40px solid rgb(231, 186, 127);
  /* border-color: rgba(0, 0, 0, 0.05); */
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.5);
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
