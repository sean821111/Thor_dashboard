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

// for (var i = 0; i < this.chartData.val.length; i++) {
//   console.log("test: " + val[i]);
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
    isRealTime: {
      type: Boolean,
      required: true,
    },
    watchingPeriod: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      chart: null,
      zoomEnd: this.watchingPeriod,
      zoomStart: 0,
    };
  },
  created() {
    let cumulatedMin = new Date().getHours() * 60 + new Date().getMinutes();
    this.setZoomRange(cumulatedMin);
     
  },
  watch: {
    chartData: {
      deep: true,
      handler(val, timeline, chartOption) {
        this.setOptions(val, timeline, chartOption);
      },
    },
    watchingPeriod: {
      handler() {
        let cumulatedMin = new Date().getHours() * 60 + new Date().getMinutes();
        this.setZoomRange(cumulatedMin);
        this.setOptions(this.chartData);
      }
    }
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
    setZoomRange(cumulatedMin) {
      if (cumulatedMin > this.watchingPeriod) {
        this.zoomStart = cumulatedMin - this.watchingPeriod;
        this.zoomEnd = cumulatedMin;
      }
    },
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
    },
    setOptions({ val, timeline, chartOption } = {}) {
      console.log("val", val);
      this.chart.setOption({
        xAxis: {
          data: timeline,
          boundaryGap: false,
          axisTick: {
            show: true,
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
          type: "value",
          min: chartOption.ymin,

          axisTick: {
            show: false,
          },
          axisLabel: {
            formatter: "{value} " + chartOption.unit,
          },
          name: chartOption.unit,
        },
        title: {
          left: "center",
          align: "right",
          padding: [0, 0, 30, 0],
          text: chartOption.title,
          textStyle: {
            fontSize: 24,
          },
        },
        dataZoom: [
          {
            type: "inside",
            disabled: this.isRealTime,
            startValue: this.zoomStart,
            endValue: this.zoomEnd,
          },
          // {
          //   type: "slider",
          //   show: false,

          //   realtime: true,
          //   start: this.zoomStart,
          //   end: this.zoomEnd,
          // },
        ],
        // legend: {
        //   data: ['this week']
        // },
        visualMap: {
          // type:'piecewise',
          top: 0,
          right: 10,
          show: false,
          pieces: [
            {
              gt: chartOption.gt,
              lte: chartOption.lte,
              color: chartOption.color,
            },
          ],
          outOfRange: {
            symbol: "diamond",
            symbolSize: [10, 10],

            color: "#FD0100",
          },
        },
        series: [
          {
            name: chartOption.title,
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#3888fa",
                // lineStyle: {
                //   color: chartOption.color,
                //   width: 2,
                // },
                areaStyle: {
                  color: chartOption.areaColor,
                },
              },
            },
            data: val,
            animation: false,
            // animationDuration: 2800,
            // animationEasing: "quadraticOut",
            markLine: {
              data: [
                {
                  name: "threshold",
                  yAxis: chartOption.threshold,
                },
              ],
              lineStyle: {
                color: "red",
                width: 1,
              },
              label: {
                position: "middle",
                fontSize: 20,
                formatter: chartOption.threshold + chartOption.unit,
              },
            },
            // markArea: {
            //   itemStyle: {
            //     color: "rgba(255, 173, 177, 0.4)",
            //   },
            //   data: [
            //     [
            //       {
            //         name: "早高峰",
            //         xAxis: "07:30",
            //       },
            //       {
            //         xAxis: "10:00",
            //       },
            //     ],
            //     [
            //       {
            //         name: "晚高峰",
            //         xAxis: "17:30",
            //       },
            //       {
            //         xAxis: "21:15",
            //       },
            //     ],
            //   ],
            // },
          },
        ],
      });
    },
  },
};
</script>
