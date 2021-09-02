<template>
  <div class="app-container">
    <date-select @dateSubmit="dateSubmit" @handleDownload="handleDownload" :exportButton="false" />

    <el-table
      :data="listData"
      border
      fit
      highlight-current-row
      style="width: 80%"
      @row-click='rowClick'
    >
      <el-table-column label="翻身時間" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.timestamp | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      style="width: 80%"
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
import DateSelect from "./../DateSelect";

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
  name: "TurnOverList",
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
      turnOverRecords: [],
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
    rowClick(row, event, column) {
      console.log(JSON.stringify(row));
      this.$emit("selected-record", row.timestamp);
    },
    getList() {
      this.listLoading = true;
      console.log(
        "start~end:" +
          this.residentId +
          ":" +
          this.recordStart +
          "~" +
          this.recordEnd
      );
  
      this.turnOverRecords = [];
      getResidentSleepRecord(
        this.residentId,
        this.recordStart,
        this.recordEnd
      ).then((response) => {
        let records = response.data;
        console.log(JSON.stringify(this.list));

        for (var i in records) {
          console.log('record: ' + JSON.stringify(records[i]));
          if (records[i].event == 2) {
            records[i].timestamp = new Date(records[i].timestamp).getTime();
            this.turnOverRecords.push(records[i]);
          }
        }
        
        this.total = this.turnOverRecords.length;
        this.getPagelist(this.listQuery);
      });
    },
    handleDownload() {
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = [
          "翻身時間"
        ];
        let filename = "";
        if (this.isDate) {
          filename =
            new Date(this.recordStart).format("yyyy-MM-dd") + " TurnOverRecord";
        } else {
          filename = new Date(this.recordStart).format("yyyy-MM-dd");
          "-" + new Date(this.recordEnd).format("yyyy-MM-dd") + " TurnOverRecord";
        }
        const data = this.exportFormat(this.listData);
        console.log("export csv:" + data);

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
        data.push([new Date(dataArray[i].timestamp).format("yyyy-MM-dd-hh:mm:ss")]);
      }
      return data;
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
        this.listData.push(this.turnOverRecords[i]);
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
