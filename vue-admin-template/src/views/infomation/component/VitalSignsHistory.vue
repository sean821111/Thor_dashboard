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
<<<<<<< HEAD
      <date-select @dateSubmit="dateSubmit" />
=======
      <date-select @dateSubmit='dateSubmit' @handleDownload='handleDownload'/>
>>>>>>> fa45919335da28816f05f7a6e7eefa0aa18dce43
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
<<<<<<< HEAD
  },
};
=======
    time: [],
  }
}
const lineChartTime = []
>>>>>>> fa45919335da28816f05f7a6e7eefa0aa18dce43

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小時
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" +  k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" +  o[k]).substr(("" + o[k]).length)));
  return fmt;
}

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
<<<<<<< HEAD
      selectType: "hr",
      initDateStart: new Date(new Date().toLocaleDateString()).getTime(),
      initDateEnd:
        new Date(new Date().toLocaleDateString()).getTime() +
        24 * 3600 * 1000 -
        1,
      isDate: true,
    };
=======
      ISOdate: undefined,
      lineChartTime: [],
      initDateStart: Date.now() - (3600 * 1000 * 24 * 7),
      initDateEnd: Date.now(),
      selectType: 'hr', 
    }
>>>>>>> fa45919335da28816f05f7a6e7eefa0aa18dce43
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
<<<<<<< HEAD
  },
  mounted() {
    // this.fetchVitalSign();
    // this.load();
  },
=======
    handleDownload() {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['time', this.selectType]
        const data = this.combineData(this.lineChartData.time, this.lineChartData.val);
        const filename = new Date(this.initDateStart).format("yyyy-MM-dd") + '-' + this.selectType;
        console.log('filename: '+ filename)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename,
          autoWidth: true,
          bookType: 'csv'
        })
      })
    },
    combineData(time, val) {
      var data = []
      for (var i = 0; i < time.length; i++) {

        data.push([time[i],val[i]])
        // data += time[i] + ',' + val[i];
        // if (i != time.length) 
        //   data += ',';
      }
      return data;
    }
  },
  // mounted(){
  //     // this.fetchVitalSign();
  //     // this.load();
  // },
>>>>>>> fa45919335da28816f05f7a6e7eefa0aa18dce43
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

<<<<<<< HEAD
.icon-spo2 {
  color: #f7b5c0;
}

.icon-pi {
  color: #96f1df;
}
=======
>>>>>>> fa45919335da28816f05f7a6e7eefa0aa18dce43
</style>
