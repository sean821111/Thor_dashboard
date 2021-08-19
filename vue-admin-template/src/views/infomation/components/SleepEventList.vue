<template>
  <div class="app-container">
    <h2>睡眠數據</h2>

    <date-select @dateSubmit="dateSubmit" />

    <el-table
      :key="tableKey"
      :data="listData"
      border
      fit
      highlight-current-row
      style="width: 80%"
    >
      <el-table-column label="No." width="80px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.num }}</span>
        </template>
      </el-table-column>
      <el-table-column label="進床時間" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.getInBedTimestamp | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入睡時間" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            (row.sleepTimestamp * 1000) | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="離床時間" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.getOutOffBedTimestamp | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="淺眠時間(秒)" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.lightSleepTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="深睡時間(秒)" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.deepSleepTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="翻身次數" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.turnOverTimes }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getPagelist"
    />
  </div>
</template>

<script>
import { getResidentSleepRecord } from "@/api/resident";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import { parseTime } from "@/utils";
import DateSelect from "./DateSelect";

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
  name: "SleepEventList",
  components: { Pagination, DateSelect },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
  },
  data() {
    return {
      listData: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
      },
      recordStart: new Date(new Date().toLocaleDateString()).getTime(),
      recordEnd:
        new Date(new Date().toLocaleDateString()).getTime() + 24 * 3600 * 1000,
      sleepAnalysises: [],
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
    this.getList();
  },
  methods: {
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

        this.sleepRecordAnalyser(response.data);
        this.total = this.sleepAnalysises.length;
        console.log("====== total:" + this.total);
        this.getPagelist(this.listQuery);
      });
    },
    handleDownload() {
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = [
          "No",
          "進床時間",
          "入睡時間",
          "離床時間",
          "淺眠時間",
          "深睡時間",
          "翻身次數",
        ];
        let filename = "";
        if (this.isDate) {
          filename =
            new Date(this.recordStart).format("yyyy-MM-dd") + " SleepRecord";
        } else {
          filename = new Date(this.recordStart).format("yyyy-MM-dd");
          "-" + new Date(this.recordEnd).format("yyyy-MM-dd") + " SleepRecord";
        }
        const data = exportFormat(this.listData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: filename,
          autoWidth: true,
          bookType: "csv",
        });
      });
    },
    exportFormat(dataArray) {
      var data = [];
      for (var i = 0; i < dataArray.length; i++) {
        data.push([
          dataArray.num[i],
          dataArray.getInBedTimestamp[i].format("yyyy-MM-dd-hh:mm"),
          dataArray.getOutOffBedTimestamp[i].format("yyyy-MM-dd-hh:mm"),
          dataArray.sleepTimestamp[i].format("yyyy-MM-dd-hh:mm"),
          dataArray.turnOverTimes[i],
          dataArray.lightSleepTime[i],
          dataArray.deepSleepTime[i],
        ]);
      }
      return data;
    },
    sleepRecordAnalyser(sleepRecords) {
      this.sleepAnalysises = [];
      let sleepIntervals = [];
      for (var i in sleepRecords) {
        if (sleepRecords[i].event == 0) {
          sleepIntervals.push([]);
        }

        sleepRecords[i].timestamp =
          new Date(sleepRecords[i].timestamp).getTime() / 1000;
        if (sleepIntervals.length > 0) {
          sleepIntervals[sleepIntervals.length - 1].push(sleepRecords[i]);
        }
      }

      for (var i in sleepIntervals) {
        let analysis = {
          num: 0,
          getInBedTimestamp: 0,
          getOutOffBedTimestamp: 0,
          sleepTimestamp: 0,
          turnOverTimes: 0,
          lightSleepTime: 0,
          deepSleepTime: 0,
        };
        analysis.num = parseInt(i) + 1;
        let checkPoint = 0,
          diffTime = 0;
        for (var j in sleepIntervals[i]) {
          if (sleepIntervals[i][j].event == 0) {
            analysis.getInBedTimestamp = sleepIntervals[i][j].timestamp;
            checkPoint = sleepIntervals[i][j].timestamp;
          } else if (sleepIntervals[i][j].event == 1) {
            analysis.getOutOffBedTimestamp = sleepIntervals[i][j].timestamp;
            console.log("getOutOffBed");
            // Not asleep.
            if (analysis.sleepTimestamp == 0) {
              diffTime = sleepIntervals[i][j].timestamp - checkPoint;
              console.log("Nonsleep diffTime = " + diffTime);
              if (diffTime > 300) {
                checkPoint += 300;
                analysis.sleepTimestamp = checkPoint;
              }
            }
            // Fall asleep.
            if (analysis.sleepTimestamp != 0) {
              diffTime = sleepIntervals[i][j].timestamp - checkPoint;
              console.log("getOutOffBed diffTime = " + diffTime);
              if (diffTime > 600) {
                // Deep sleep
                analysis.deepSleepTime += diffTime;
              } else {
                // Light sleep
                analysis.lightSleepTime += diffTime;
              }
            }
          } else {
            analysis.turnOverTimes += 1;
            diffTime = sleepIntervals[i][j].timestamp - checkPoint;
            // Not sleep.
            if (analysis.sleepTimestamp == 0) {
              if (diffTime > 300) {
                checkPoint += 300;
                analysis.sleepTimestamp = checkPoint;
              } else {
                checkPoint = sleepIntervals[i][j].timestamp;
              }
            }
            // Fall asleep.
            if (analysis.sleepTimestamp != 0) {
              diffTime = sleepIntervals[i][j].timestamp - checkPoint;
              // console.log("turnOver diffTime = " + diffTime);
              // Deep sleep
              if (diffTime > 600) {
                let count = parseInt(diffTime / 600);
                analysis.deepSleepTime += count * 600;
                checkPoint += count * 600;
                diffTime = sleepIntervals[i][j].timestamp - checkPoint;
              }
              // Light sleep
              if (diffTime > 0) {
                analysis.lightSleepTime += 600;
                checkPoint += 600;
              }
            }
          }
        }

        this.sleepAnalysises.unshift(analysis);
      }
    },
    getPagelist(listQuery) {
      var page = listQuery.page;
      var limit = listQuery.limit;
      var i = (page - 1) * limit;
      var l;
      this.total - page * limit > 0 ? (l = page * limit) : (l = this.total);
      console.log("page: " + page + ",limit:" + limit);
      console.log("n: " + i + ",limit:" + l);

      this.listData = [];
      for (i; i < l; i++) {
        this.listData.push(this.sleepAnalysises[i]);
      }
    },
    dateSubmit(isDate, dateSelect) {
      this.isDate = isDate;
      if (isDate) {
        // Convert date to 00:00 in timestamp
        this.recordStart = new Date(
          new Date(dateSelect).toLocaleDateString()
        ).getTime();
        this.recordEnd = this.recordStart + 24 * 3600 * 1000;
      } else {
        this.recordStart = new Date(
          new Date(dateSelect).toLocaleDateString()
        ).getTime();
        this.recordEnd = this.recordStart + 24 * 3600 * 1000 * 7;

        // console.log("====== select week from emit: " + dateSelect);
      }

      this.getList();
    },
  },
};
</script>
