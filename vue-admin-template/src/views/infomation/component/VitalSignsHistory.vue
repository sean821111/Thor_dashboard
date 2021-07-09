<template>
  <div class="dashboard-editor-container">

    <el-row style="padding:6px 6px 0;margin-bottom:6px; font-size:20px;">
      <el-col :xs="10" :sm="10" :lg="4" >
        <svg-icon icon-class="user" style="color: #36a3f7;"/> 
        <span style="color: rgba(0, 0, 0, 0.45); font-size:16; font-weight: bold;" >
        {{this.residentName}}
        </span>
      </el-col>
    </el-row>

    <panel-group @handleSetLineChartData="handleSetLineChartData" />
    <el-row>
      <date-select @dateSubmit='dateSubmit'/>
    </el-row>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <el-row>
      <!-- <p> test {{this.testTime}} </p> -->
      <!-- <p>起始日期{{ this.initDateStart }}</p>
      <p>結束日期{{ this.initDateEnd }}</p>
      <p> {{this.$route.query.residentId }}</p>
      <p>vital signs array {{lineChartData.val}}</p>
      -->

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
import PanelGroup from './PanelGroup'
import LineChart from './LineChart'
import DateSelect from './DateSelect'
// import BarChart from './components/BarChart'
import { getResidentVitalSignsRecord, getResidentInfo } from "@/api/resident";
import { dataTool } from 'echarts/lib/echarts';

// const lineChartData = {
//   hr: {
//     expectedData: [100, 120, 161, 134, 105, 160, 165, 150],
//     actualData: [120, 82, 91, 154, 162, 140, 145, 224]
//   },
//   temp: {
//     expectedData: [200, 192, 120, 144, 160, 130, 140],
//     actualData: [180, 160, 151, 106, 145, 150, 130]
//   },
//   spo2: {
//     expectedData: [80, 100, 121, 104, 105, 90, 100],
//     actualData: [120, 90, 100, 138, 142, 130, 130]
//   },
//   pi: {
//     expectedData: [130, 140, 141, 142, 145, 150, 160],
//     actualData: [120, 82, 91, 154, 162, 140, 130]
//   }
// }
var lineChartData = {
  hr: {
    chartOption:{
      title: "心率",
      unit: "BPM",
      color: "#40c9c6",
      areaColor: "#a8f0ef"
    },
    val: [],
    time: []
  },
  temp: {
    chartOption:{
      title: "體溫",
      unit: "℃",
      color: "#3888fa",
      areaColor: "#f3f8ff"

    },
    val: [],
    time: []
  },
  spo2: {
    chartOption:{
      title: "血氧濃度",
      unit: "%",
      color: "#f4516c",
      areaColor: "#f7b5c0"
    },
    val: [],
    time: []
  },
  pi: {
    chartOption:{
      title: "灌注指標",
      unit: "%",
      color: "#34bfa3",
      areaColor: "#96f1df"
    },
    val: [],
    time: []
  }
}
const lineChartTime = []

export default {
  name: 'DashboardChart',
  components: {
    PanelGroup,
    LineChart,
    DateSelect,
    // BarChart,
  },
  data() {
    return {
      residentName: '',
      lineChartData: lineChartData.hr,
      vitalSigns: null,
      isConnected: null,
      ISOdate: undefined,
      lineChartTime: [],
      initDateStart: Date.now() - (3600 * 1000 * 24 * 7),
      initDateEnd: Date.now(),
      selectType: 'hr'
      
    }
  },
  props: {
    residentId: {
      type: String,
      required: true,
    }
  },
  created(){  
    // this.fetchVitalSign();
    this.getCurrentRecord();
    this.getResidentName();
  },
  methods: {
    getCurrentRecord(){
      
      // initialize chart data
      lineChartData.hr.val = [];
      lineChartData.hr.time = [];
      lineChartData.temp.val = [];
      lineChartData.temp.time = [];
      lineChartData.spo2.val = [];
      lineChartData.spo2.time = [];
      lineChartData.pi.val = [];
      lineChartData.pi.time = [];
      getResidentVitalSignsRecord(this.residentId, this.initDateStart, this.initDateEnd).then((response)=> {
        this.vitalSigns = response.data;
        this.vitalSigns.forEach(element => {
          var hr = element.vitalSigns.hr;
          var temp = Math.round(element.vitalSigns.temp *10)/10;
          var spo2 = element.vitalSigns.spo2;
          var pi = Math.round(element.vitalSigns.temp *100)/100;

          lineChartData.hr.val.push(hr);
          lineChartData.temp.val.push(temp);
          lineChartData.spo2.val.push(spo2);
          lineChartData.pi.val.push(pi);

          var t = new Date(element.timestamp).toLocaleTimeString();
          t = t.slice(0,6);
          var d = new Date(element.timestamp).toLocaleDateString();
          d = d.slice(5,9)
          var dt = d + t;
          lineChartData.hr.time.push(dt);
          lineChartData.temp.time.push(dt);
          lineChartData.spo2.time.push(dt);
          lineChartData.pi.time.push(dt);


          // lineChartTime.push(dt);
        });
      });

    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
      this.selectType = type
    },
    dateSubmit(dateRange){
      this.initDateStart = dateRange[0];
      this.initDateEnd = dateRange[1];
      // initialize chart data
      lineChartData.hr.val = [];
      lineChartData.hr.time = [];
      lineChartData.temp.val = [];
      lineChartData.temp.time = [];
      lineChartData.spo2.val = [];
      lineChartData.spo2.time = [];
      lineChartData.pi.val = [];
      lineChartData.pi.time = [];
      this.getCurrentRecord();
    },
    getResidentName(){
      getResidentInfo(this.residentId).then((response)=>{
        this.residentName = response.data.info.name;
      });
    },
    load(){
      // this.timestamp = Math.floor(Date.now()*1000);
      // this.datetime = new Date.toISOString();
      // this.ISOdate = this.datetime.toISOString();
      // console.log('current datetime: '+ this.datetime.toISOString());
    }
  },
  mounted(){
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
}
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

@media (max-width:1024px) {
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
      color: #96f1df
    }


</style>
