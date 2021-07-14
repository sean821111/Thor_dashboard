<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";

// var chartTime = [];
// var cnt = 0;
// for (var h = 0; h < 24; h++) {
//   for (var m = 0; m < 60; m++) {
//     var hour = h;
//     var minute = m;
//     if (h < 10) hour = "0" + hour;
//     if (m < 10) minute = "0" + minute;

//     var time = hour + ":" + minute;
//     chartTime[cnt] = time;
//     cnt = cnt + 1;
//   }
// }

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "350px",
    },
    autoResize: {
      type: Boolean,
      default: true,
    },
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val, timeline, chartOption) {
        this.setOptions(val, timeline, chartOption);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
    },
    setOptions({ val, timeline, chartOption } = {}) {
      this.chart.setOption({
        xAxis: {
          data: timeline,
          boundaryGap: false,
          axisTick: {
            show: false,
          },
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          padding: [5, 10],
        },
        yAxis: {
          axisTick: {
            show: false,
          },
          name: chartOption.unit,
        },
        title: {
          left: "center",
          text: chartOption.title,
          textStyle: {
            fontSize: 24,
          },
        },

        // legend: {
        //   data: ['this week']
        // },
        series: [
          {
            name: chartOption.title,
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#3888fa",
                lineStyle: {
                  color: chartOption.color,
                  width: 2,
                },
                areaStyle: {
                  color: chartOption.areaColor,
                },
              },
            },
            data: val,
            animationDuration: 2800,
            animationEasing: "quadraticOut",
          },
        ],
      });
    },
  },
};
</script>
