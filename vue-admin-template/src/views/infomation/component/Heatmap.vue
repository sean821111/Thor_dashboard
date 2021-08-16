<template>
  <div margin-width="25%" class="dashboard-editor-container">
    <el-row>
      <el-col
        ><div>
          <h1>{{ this.bedNum }}床壓力分佈圖</h1>
        </div></el-col
      >
    </el-row>

    <el-row style="margin-bottom: 32px">
      <el-col :xs="18" :sm="15" :lg="10">
        <div id="heatmap" class="heatmapjs-container">
          <div class="pillow-wrapper"></div>
        </div>
      </el-col>
      <el-col :xs="5" :sm="5" :lg="5">
        <!-- <VueSlideBar
            v-model="slider.value"
            :data="slider.data"
            :range="slider.range"
            :line-height="30"
            :processStyle="slider.processStyle"
            :draggable="false"
          /> -->
        <radial-bar
          :chart-title="radialChartTitle"
          :chart-value="sleepQuality"
        />
      </el-col>
    </el-row>
    <el-row> </el-row>
    <el-row :gutter="32">
      <el-col class="card-panel">
        <div class="card-panel-text"></div>
      </el-col>
      <!-- <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <paris-bar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <paris-bar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <paris-bar-chart />
        </div>
      </el-col> -->
    </el-row>
  </div>
</template>


<script>
import Heatmap from "heatmap.js";
import { getResidentInfo } from "@/api/resident";
import RadialBar from "./RadialBar";
import ParisBarChart from "./ParisBarChart";

// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

var barChartData = {
  times: {
    chartOption: {
      title: "翻身次數",
      unit: "times",
      color: "#40c9c6",
      areaColor: "#a8f0ef",
    },
    val: [1, 2, 3, 4, 5],
    timeline: ["Mon", "Tue", "Wed", "Thr", "Fri"],
  },
};

export default {
  name: "Heatmap",
  components: {
    RadialBar,
    ParisBarChart,
  },
  data() {
    return {
      barChartData: barChartData.times,
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
      });
    },
    initData() {
      this.heatmapInstance = Heatmap.create({
        container: document.getElementById("heatmap"),
        radius: 80,
        blur: 0.7,
      });
      console.log("this.heatmapInstance " + this.heatmapInstance);
      var points = [];

      getResidentInfo(this.residentId).then((response) => {
        if (response.data.pairsDevice != null) {
          this.pressureData = response.data.pairsDevice.rawData;
          console.log("mounted paris data: " + this.pressureData);
          for (var i = 2; i > -1; i--) {
            for (var j = 0; j < 5; j++) {
              var index = i * 5 + j;

              console.log("index " + index + ": " + this.pressureData[index]);
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
          console.log("index " + index + ": " + data);
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
  border-left: 80px solid rgb(231, 186, 127);
  /* border-color: rgba(0, 0, 0, 0.05); */
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.5);
}
.radial-bar-wrapper {
  margin-left: 5%;
}
.card-panel {
  background: #fff;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.05);
}
.card-panel-text {
  line-height: 18px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 18px;
  margin-bottom: 12px;
}
.vue-slide-bar-process {
  /* position: absolute; */
  border-radius: 15px;
  /* transition: all 0s; */
  /* z-index: 1; */
  /* width: 0; */
  /* height: 100%; */
  /* top: 0; */
  /* left: 0; */
  /* will-change: width; */
  /* background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%) !important; */
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
