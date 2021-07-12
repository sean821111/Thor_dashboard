<template>
  <div class="dashboard-editor-container">
    <el-row style="padding: 6px 6px 0; margin-bottom: 6px; font-size: 20px">
      <el-col :xs="10" :sm="10" :lg="4">
        <svg-icon icon-class="user" style="color: #36a3f7" />
        <span
          style="color: rgba(0, 0, 0, 0.45); font-size: 16; font-weight: bold"
        >
          {{ this.residentName }}
        </span>
      </el-col>
    </el-row>

    <panel-group @handleSetLineChartData="handleSetLineChartData" />
    <el-row>
      <date-select @dateSubmit="dateSubmit" />
    </el-row>
    <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <el-row>
      <!-- <p> test {{this.testTime}} </p> -->
      <p>起始日期{{ this.initDateStart }}</p>
      <p>結束日期{{ this.initDateEnd }}</p>
      <p>{{ this.$route.query.residentId }}</p>
      <p>vital signs array {{ lineChartData.val }}</p>
      <p>time arrry{{ lineChartData.time }}</p>
    </el-row>
    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
import PanelGroup from "./PanelGroup";
import LineChart from "./LineChart";
import DateSelect from "./DateSelect";
// import BarChart from './components/BarChart'
import { getResidentVitalSignsRecord, getResidentInfo } from "@/api/resident";
import { dataTool } from "echarts/lib/echarts";

var lineChartData = {
  hr: {
    chartOption: {
      title: "心率",
      unit: "BPM",
      color: "#40c9c6",
      areaColor: "#a8f0ef",
    },
    val: [],
    weeklyDate: [],
    isDate: true,
  },
  temp: {
    chartOption: {
      title: "體溫",
      unit: "℃",
      color: "#3888fa",
      areaColor: "#f3f8ff",
    },
    val: [],
  },
  spo2: {
    chartOption: {
      title: "血氧濃度",
      unit: "%",
      color: "#f4516c",
      areaColor: "#f7b5c0",
    },
    val: [],
  },
  pi: {
    chartOption: {
      title: "灌注指標",
      unit: "%",
      color: "#34bfa3",
      areaColor: "#96f1df",
    },
    val: [],
  },
};

export default {
  name: "DashboardChart",
  components: {
    PanelGroup,
    LineChart,
    DateSelect,
    // BarChart,
  },
  data() {
    return {
      residentName: "",
      lineChartData: lineChartData.hr,
      vitalSigns: null,
      isConnected: null,
      selectType: "hr",
      initDateStart: new Date(new Date().toLocaleDateString()).getTime(),
      initDateEnd:
        new Date(new Date().toLocaleDateString()).getTime() +
        24 * 3600 * 1000 -
        1,
      isDate: true,
    };
  },
  props: {
    residentId: {
      type: String,
      required: true,
    },
  },
  created() {
    this.getCurrentRecord();
    // this.testDate();
    this.getResidentName();
  },
  methods: {
    testDate() {
      console.log("------start time:" + this.initDateStart);
      var dd = (this.initDateStart + 60 * 1000) / 1000;
      // (new Date(new Date().toLocaleDateString()).getTime() + 60 * 1000) /
      // 1000;
      console.log("------step time: " + dd);
      console.log("------end time:" + this.initDateEnd);
    },
    getCurrentRecord() {
      // initialize chart data
      lineChartData.hr.val = [];
      lineChartData.temp.val = [];
      lineChartData.spo2.val = [];
      lineChartData.pi.val = [];
      var endMinute = 24 * 60;

      var init = true;
      var timestep;
      getResidentVitalSignsRecord(
        this.residentId,
        this.initDateStart,
        this.initDateEnd
      ).then((response) => {
        this.vitalSigns = response.data;
        console.log("length of data: " + this.vitalSigns.length);
        this.vitalSigns.forEach((element) => {
          var t = new Date(element.timestamp).toLocaleTimeString("chinese", {
            hour12: false,
          });
          t = t.slice(0, 5);
          var hour = t.slice(0, 3);
          if (parseInt(hour) == 24) {
            hour = 0;
          }
          var min = t.slice(3, 5);
          // console.log("record time: " + hour + ":" + min);
          if (init) {
            timestep = parseInt(hour) * 60 + parseInt(min);
            for (var i = 0; i < timestep; i++) {
              lineChartData.hr.val.push("");
              lineChartData.temp.val.push("");
              lineChartData.spo2.val.push("");
              lineChartData.pi.val.push("");
            }
            init = false;
            console.log("only call me first");
          } else if (timestep < endMinute) {
            var currentStep = parseInt(hour) * 60 + parseInt(min);
            var diff = currentStep - timestep - 1;
            timestep = currentStep;
            if (diff != 0) {
              for (var i = 0; i < diff; i++) {
                lineChartData.hr.val.push("");
                lineChartData.temp.val.push("");
                lineChartData.spo2.val.push("");
                lineChartData.pi.val.push("");
              }
            } else {
              var hr = element.vitalSigns.hr;
              var temp = Math.round(element.vitalSigns.temp * 10) / 10;
              var spo2 = element.vitalSigns.spo2;
              var pi = Math.round(element.vitalSigns.temp * 100) / 100;

              lineChartData.hr.val.push(hr);
              lineChartData.temp.val.push(temp);
              lineChartData.spo2.val.push(spo2);
              lineChartData.pi.val.push(pi);
            }
          }
        });
      });
    },
    getWeeklyRecord() {},
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type];
      this.selectType = type;
    },
    dateSubmit(isDate, dateSelect) {
      lineChartData.hr.val = [];
      lineChartData.temp.val = [];
      lineChartData.spo2.val = [];
      lineChartData.pi.val = [];

      if (isDate) {
        console.log("====== select date from emit: " + dateSelect);
        // Convert date to 00:00 in timestamp
        this.initDateStart = new Date(
          new Date(dateSelect).toLocaleDateString()
        ).getTime();
        this.initDateEnd =
          new Date(new Date(dateSelect).toLocaleDateString()).getTime() +
          24 * 3600 * 1000 -
          1;
        // get daily record
        this.getCurrentRecord();
      } else {
        console.log("====== select week from emit: " + dateSelect);
      }
    },
    getResidentName() {
      getResidentInfo(this.residentId).then((response) => {
        this.residentName = response.data.info.name;
      });
    },
    load() {
      // this.timestamp = Math.floor(Date.now()*1000);
      // this.datetime = new Date.toISOString();
      // this.ISOdate = this.datetime.toISOString();
      // console.log('current datetime: '+ this.datetime.toISOString());
    },
  },
  mounted() {
    // this.fetchVitalSign();
    // this.load();
  },
  // cron:[{
  //     time:120000,
  //     method:'fetchVitalSign'
  // },
  // {
  //   time:1000,
  //   method: 'load'

  // }]
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

.icon-hr {
  color: #a8f0ef;
}

.icon-temp {
  color: #36a3f7;
}

.icon-spo2 {
  color: #f7b5c0;
}

.icon-pi {
  color: #96f1df;
}
</style>
