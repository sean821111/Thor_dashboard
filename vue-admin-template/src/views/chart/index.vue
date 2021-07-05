<template>
  <div class="dashboard-editor-container">

    <el-row style="padding:6px 6px 0;margin-bottom:6px; font-size:20px">
      <el-col :xs="10" :sm="10" :lg="4" >
        <svg-icon icon-class="Thor_device"/> {{this.$route.query.deviceName}}  
      </el-col>
    </el-row>

    <panel-group @handleSetLineChartData="handleSetLineChartData" :vitalSigns="vitalSigns" />
    <el-row>
      <date-select />
    </el-row>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <el-row>
      <p>父組件接收到的子組件值：{{ dateRange }}</p>

      <div @dateSubmit="dateSubmit($event)"></div>
    </el-row>
    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->
  <p>提示：{{this.$route.params.residentId}}</p>

  </div>
</template>

<script>
import { getVitalSign,  } from "@/api/device";
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import DateSelect from './components/DateSelect'
// import BarChart from './components/BarChart'

const lineChartData = {
  hr: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  temp: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  spo2: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  pi: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    DateSelect,
    // BarChart,
  },
  data() {
    return {
      lineChartData: lineChartData.hr,
      vitalSigns: null,
      isConnected: null,
      ISOdate: undefined,
      datetime: new Date(),
      dateRange: '',
      initDateStart: new Date(),
      initDateEnd: new Date()
    }
  },
  created(){  
    this.fetchVitalSign();
    this.getCurrentRecord();
  },
  methods: {
    dateSubmit(dateRange){
      this.dateRange = dateRange;
      console.log("父組件 " + this.dateRange);
    },
    fetchVitalSign() {
        getVitalSign(this.$route.query.deviceName).then((response)=> {
            this.vitalSigns = response.data.vitalSigns;
            this.isConnected = response.data.isConnected;
            console.log("get vital signs");
            // console.log("get vital sign"  + JSON.stringify(response.data));
            // console.log("get vital sign: "  + JSON.stringify(this.vitalSigns.pi));
            
        });
    },
    getCurrentRecord(){
      this.initDateStart.setTime(this.initDateStart.getTime() - 3600 * 1000 * 24 * 7);
      console.log("current date range: " + this.initDateStart.toISOString() + this.initDateEnd.toISOString());
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    load(){
      // this.timestamp = Math.floor(Date.now()*1000);
      // this.datetime = new Date.toISOString();
      // this.ISOdate = this.datetime.toISOString();
      // console.log('current datetime: '+ this.datetime.toISOString());
    }
  },
  mounted(){
      this.fetchVitalSign();
      this.load();
  },
  cron:[{
      time:120000,
      method:'fetchVitalSign'
  },
  {
    time:1000,
    method: 'load'

  }]
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

</style>
