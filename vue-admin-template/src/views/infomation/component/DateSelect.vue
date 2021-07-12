<template>
  <div>
    <!-- <div class="block">
        <span class="demonstration">默认</span>
        {{value6}}
        <el-date-picker
        v-model="value6"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
        </el-date-picker>
    </div> -->
    <el-row>
      <el-col
        :xs="1.5"
        :sm="1.5"
        :md="1.5"
        :lg="1.5"
        style="padding: 6px 6px 6px"
      >
        <el-button
          type="info"
          @click="showWeek"
          style="font-szie: 18px; font-weight: bold"
          >週</el-button
        >
        <el-button
          type="info"
          @click="showDate"
          style="font-szie: 18px; font-weight: bold"
          >日</el-button
        >
      </el-col>
      <el-col
        :xs="10"
        :sm="7"
        :md="6"
        :lg="5"
        :xl="3"
        style="margin-bottom: 10px"
      >
        <el-date-picker
          v-if="isDate"
          v-model="dateSelect"
          align="right"
          type="date"
          placeholder="選擇日期"
          :picker-options="pickerOptions1"
        >
        </el-date-picker>
        <el-date-picker
          v-else
          v-model="dateSelect"
          type="week"
          format="yyyy 第 WW 週"
          placeholder="選擇週"
        >
        </el-date-picker>
      </el-col>

      <el-col :xs="8" :sm="7" :md="5" :lg="5">
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          @click="last"
        ></el-button>
        <el-button
          type="primary"
          icon="el-icon-arrow-right"
          @click="next"
        ></el-button>
        <el-button type="primary" @click="dateSubmit" style="font-size: 16px"
          >確認</el-button
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      isDate: true,
      isWeek: false,
      dateSelect: new Date(),
    };
  },
  methods: {
    dateSubmit() {
      if (this.dateSelect == "") {
        this.$message({
          message: "請選擇時間！",
          type: "warning",
        });
      } else if (this.isDate) {
        this.$emit("dateSubmit", this.isDate, this.dateSelect);
      } else {
        this.dateSelect = this.getSunday(this.dateSelect, "this");
        this.$emit("dateSubmit", this.isDate, this.dateSelect);
        console.log("submit on first day of the week:" + this.dateSelect);
      }
    },
    next() {
      if (this.dateSelect == "") {
        this.$message({
          message: "請選擇時間！",
          type: "warning",
        });
      } else if (this.isDate) {
        var nextDay = new Date(this.dateSelect);
        nextDay.setDate(nextDay.getDate() + 1);
        this.dateSelect = nextDay;
        console.log("next date select: " + this.dateSelect);
      } else {
        this.dateSelect = this.getSunday(this.dateSelect, "next");
        console.log("next week select: " + new Date(this.dateSelect));
      }
    },
    last() {
      if (this.dateSelect == "") {
        this.$message({
          message: "請選擇時間！",
          type: "warning",
        });
      } else if (this.isDate) {
        var lastDay = new Date(this.dateSelect);
        lastDay.setDate(lastDay.getDate() - 1);
        this.dateSelect = lastDay;
        console.log("last date select: " + this.dateSelect);
      } else {
        this.dateSelect = this.getSunday(this.dateSelect, "last");
        console.log("last week select: " + new Date(this.dateSelect));
      }
    },
    getSunday(d, select) {
      d = new Date(d);
      var day = d.getDay(); //Sun indicate 0 and Mon indicate 1 ...
      if (select == "this") var diff = d.getDate() - day;
      else if (select == "next") var diff = d.getDate() - day + 7;
      else if (select == "last") var diff = d.getDate() - day - 7;
      return new Date(d.setDate(diff));
    },
    showWeek() {
      this.isDate = false;
    },
    showDate() {
      this.isDate = true;
    },
  },
};
</script>