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
      <date-select @dateSubmit="dateSubmit" @handleDownload="handleDownload" />
    </el-row>
    <el-row style="background: #fff; padding: 16px 16px 0; margin-bottom: 32px">
      <line-chart :chart-data="lineChartData" :isDate="this.isDate" />
    </el-row>
    <el-row>
      <!-- <p> test {{this.testTime}} </p>
      <p>起始日期{{ this.initDateStart }}</p>
      <p>結束日期{{ this.initDateEnd }}</p>
      <p>{{ this.$route.query.residentId }}</p>
      <p>vital signs array {{ lineChartData.val }}</p> -->
      <!-- <p>time arrry{{ lineChartData.time }}</p> -->
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
    timeline: [],
  },
  temp: {
    chartOption: {
      title: "體溫",
      unit: "℃",
      color: "#3888fa",
      areaColor: "#f3f8ff",
    },
    val: [],
    timeline: [],
  },
  spo2: {
    chartOption: {
      title: "血氧濃度",
      unit: "%",
      color: "#f4516c",
      areaColor: "#f7b5c0",
    },
    val: [],
    timeline: [],
  },
  pi: {
    chartOption: {
      title: "灌注指標",
      unit: "%",
      color: "#34bfa3",
      areaColor: "#96f1df",
    },
    val: [],
    timeline: [],
  },
};
const lineChartTime = [];

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小時
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
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
      vitalSignRecords: null,
      isConnected: null,
      selectType: "hr",
      initDateStart: new Date(new Date().toLocaleDateString()).getTime(),
      initDateEnd:
        new Date(new Date().toLocaleDateString()).getTime() + 24 * 3600 * 1000,
      isDate: true,
      timeline: [],
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
    this.setTimeline();
  },
  watch: {
    vitalSignRecords: function (records) {
      lineChartData.hr.val = [];
      lineChartData.temp.val = [];
      lineChartData.spo2.val = [];
      lineChartData.pi.val = [];
      this.setTimeline();
      lineChartData.hr.timeline = this.timeline;
      lineChartData.temp.timeline = this.timeline;
      lineChartData.spo2.timeline = this.timeline;
      lineChartData.pi.timeline = this.timeline;

      if (this.isDate) {
        // Initialize data array for line chart
        for (var i = 0; i < 24 * 60; i++) {
          lineChartData.hr.val.push("");
          lineChartData.temp.val.push("");
          lineChartData.spo2.val.push("");
          lineChartData.pi.val.push("");
        }
        console.log("length of data: " + records.length);
        records.forEach((element) => {
          // console.log("test: " + test)
          // lineChartData.hr.val[test++] = 100 + test * 10;
          var t = new Date(element.timestamp);
          const hour = t.getHours();
          const min = t.getMinutes();

          let timeIndex = hour * 60 + min;
          var hr = element.vitalSigns.hr;
          var temp = Math.round(element.vitalSigns.temp * 10) / 10;
          var spo2 = element.vitalSigns.spo2;

          var pi = Math.round(element.vitalSigns.temp * 100) / 100;
          lineChartData.hr.val[timeIndex] = hr;
          lineChartData.temp.val[timeIndex] = temp;
          lineChartData.spo2.val[timeIndex] = spo2;
          lineChartData.pi.val[timeIndex] = pi;
        });
      } else {
        // weekly records
        // Initialize data array for line chart
        console.log(
          "!!!!!!! Week start ~ end date: " +
            "=>" +
            this.initDateStart +
            "~" +
            this.initDateEnd
        );
        var totalHr = [0, 0, 0, 0, 0, 0, 0];
        var totalTemp = [0, 0, 0, 0, 0, 0, 0];
        var totalSpo2 = [0, 0, 0, 0, 0, 0, 0];
        var totalPi = [0, 0, 0, 0, 0, 0, 0];
        var DataLength = [0, 0, 0, 0, 0, 0, 0];

        records.forEach((element) => {
          var day = new Date(element.timestamp).getDay();

          var hr = element.vitalSigns.hr;
          var temp = Math.round(element.vitalSigns.temp * 10) / 10;
          var spo2 = element.vitalSigns.spo2;
          var pi = Math.round(element.vitalSigns.temp * 100) / 100;

          DataLength[day] += 1;
          totalHr[day] += hr;
          totalTemp[day] += temp;
          totalSpo2[day] += spo2;
          totalPi[day] += pi;
        });

        for (var i = 0; i < 7; i++) {
          if (DataLength[i] == 0) {
            lineChartData.hr.val.push("");
            lineChartData.temp.val.push("");
            lineChartData.spo2.val.push("");
            lineChartData.pi.val.push("");
          } else {
            lineChartData.hr.val.push(totalHr[i] / DataLength[i]);
            lineChartData.temp.val.push(totalTemp[i] / DataLength[i]);
            lineChartData.spo2.val.push(totalSpo2[i] / DataLength[i]);
            lineChartData.pi.val.push(totalPi[i] / DataLength[i]);
          }
        }

        //   for (var i = 0; i < 7; i++) {
        //     if (i != 0) {
        //       this.initDateStart =
        //         new Date(
        //           new Date(this.initDateStart).toLocaleDateString()
        //         ).getTime() +
        //         24 * 3600 * 1000;
        //     }
        //     this.initDateEnd =
        //       new Date(
        //         new Date(this.initDateStart).toLocaleDateString()
        //       ).getTime() +
        //       24 * 3600 * 1000;
        //     console.log(
        //       "!!!!!!! Week start ~ end date: " +
        //         i +
        //         "=>" +
        //         this.initDateStart +
        //         "~" +
        //         this.initDateEnd
        //     );
        //     var hr_total = 0;
        //     var temp_total = 0;
        //     var spo2_total = 0;
        //     var pi_total = 0;
        //     var DataLength = 0;
        //     if (new Date(this.initDateStart).getDay() == 4) {
        //       records.forEach((element) => {
        //         console.log(
        //           "===== : " +
        //             new Date(this.initDateStart) +
        //             "======: " +
        //             element.vitalSigns.hr
        //         );
        //       });
        //     }
        //     records.forEach((element) => {
        //       DataLength += 1;
        //       hr_total += element.vitalSigns.hr;
        //       temp_total += Math.round(element.vitalSigns.temp * 10) / 10;
        //       spo2_total += element.vitalSigns.spo2;
        //       pi_total += Math.round(element.vitalSigns.temp * 100) / 100;
        //     });
        //     if (DataLength != 0) {
        //       lineChartData.hr.val.push(hr_total / DataLength);
        //       lineChartData.temp.val.push(temp_total / DataLength);
        //       lineChartData.spo2.val.push(spo2_total / DataLength);
        //       lineChartData.pi.val.push(pi_total / DataLength);
        //     } else {
        //       lineChartData.hr.val.push("");
        //       lineChartData.temp.val.push("");
        //       lineChartData.spo2.val.push("");
        //       lineChartData.pi.val.push("");
        //     }
        //   }
      }
    },
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

      getResidentVitalSignsRecord(
        this.residentId,
        this.initDateStart,
        this.initDateEnd
      ).then((response) => {
        this.vitalSignRecords = response.data;
      });
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type];
      this.selectType = type;
    },
    dateSubmit(isDate, dateSelect) {
      this.isDate = isDate;
      if (isDate) {
        console.log("====== select date from emit: " + dateSelect);
        // Convert date to 00:00 in timestamp
        this.initDateStart = new Date(
          new Date(dateSelect).toLocaleDateString()
        ).getTime();
        this.initDateEnd = this.initDateStart + 24 * 3600 * 1000;
      } else {
        this.initDateStart = new Date(
          new Date(dateSelect).toLocaleDateString()
        ).getTime();
        this.initDateEnd = this.initDateStart + 24 * 3600 * 1000 * 7;

        console.log("====== select week from emit: " + dateSelect);
      }
      // get weekly or daily record
      this.getCurrentRecord();
      this.setTimeline();
    },
    getResidentName() {
      getResidentInfo(this.residentId).then((response) => {
        this.residentName = response.data.info.name;
      });
    },
    setTimeline() {
      // console.log("this.isDate" + this.isDate);
      // console.log("this.timeline.length" + this.timeline.length);
      if (this.isDate && this.timeline.length <= 7) {
        this.timeline = [];
        let date = new Date(this.initDateStart);
        for (let hour = 0; hour < 24; hour++) {
          date.setHours(hour);
          for (let min = 0; min < 60; min++) {
            date.setMinutes(min);
            this.timeline.push(date.format("hh:mm"));
          }
        }
        // console.log("timeline" + this.timeline);
      } else if (!this.isDate && this.timeline.length > 7) {
        this.timeline = [];
        let date = new Date(this.initDateStart);
        for (let day = 0; day < 7; day++) {
          this.timeline.push(date.format("yyyy-MM-dd"));
          date.setDate(date.getDate() + 1);
        }
        // console.log("timeline" + this.timeline);
      }
    },
    handleDownload() {
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["time", this.selectType];
        const data = this.combineData(this.timeline, this.lineChartData.val);
        let filename = "";
        if (this.isDate) {
          filename =
            new Date(this.initDateStart).format("yyyy-MM-dd") +
            "-" +
            this.selectType;
        } else {
          filename =
            new Date(this.initDateStart).format("yyyy-MM-dd") +
            "-" +
            new Date(this.initDateEnd).format("yyyy-MM-dd") +
            "-" +
            this.selectType;
        }
        console.log("filename: " + filename);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename,
          autoWidth: true,
          bookType: "csv",
        });
      });
    },
    combineData(time, val) {
      var data = [];
      for (var i = 0; i < time.length; i++) {
        data.push([time[i], val[i]]);
        // data += time[i] + ',' + val[i];
        // if (i != time.length)
        //   data += ',';
      }
      return data;
    },
  },
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
