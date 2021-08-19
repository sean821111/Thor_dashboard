<template>
  <div class="app-container">
    <h1>101床-睡眠紀錄</h1>
    <el-row>
      <div class="date-selection">
        <el-date-picker
          v-model="value1"
          type="date"
          placeholder="選擇起始日期"
          popper-class="date-style"
        >
        </el-date-picker>
      </div>
    <div class="date-selection">
      <el-date-picker
        v-model="value1"
        type="date"
        placeholder="選擇結束日期"
        popper-class="date-style"
      >
      </el-date-picker>
    </div>
    </el-row>
    <el-table
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        v-loading="loading"
        align="center"
        element-loading-text="请给我点时间！"
        fixed
        prop="date"
        label="日期"
      >
      </el-table-column>

      <el-table-column align="center" prop="event" label="事件">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
// import "../../../../assets/common.less";
export default {
  name: "EventRecord",

  data() {
    return {
      tableData: [
        {
          date: "2016-05-02",
          event: "臥床",
        },
        {
          date: "2016-05-04",
          event: "離床",
        },
        {
          date: "2016-05-01",
          event: "臥床",
        },
      ],
      value1: "",
    };
  },
  methods: {
    loading() {
      
    }
  }
};
</script>

<style scoped>
.date-selection {
  margin: auto;
  width: 50%;
  /* border: 3px solid green; */
  padding: 10px;
}
</style>