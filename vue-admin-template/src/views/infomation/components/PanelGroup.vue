<template>
  <el-row :gutter="30" class="panel-group">
    <el-col :xs="10" :sm="10" :lg="4" class="card-panel-col">
      <div class="card-panel" >
        <div class="card-panel-icon-wrapper icon-hr" @click="handleSetLineChartData('hr')">
          <svg-icon icon-class="cardiogram" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">心率</div>
          <div class="card-panel-text">(BPM)</div>
          <!-- <el-input-number v-model="vitalSignsThresh.hr" @change="updateThresh" controls-position="right" size="small" /> -->
        
          <!-- <span class="card-panel-num">{{vitalSigns.hr}}</span> -->
          <!-- <count-to :start-val="0" :end-val="80" :duration="3200" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel" >
        <div class="card-panel-icon-wrapper icon-temp">
          <svg-icon icon-class="celsius" class-name="card-panel-icon" @click="handleSetLineChartData('temp')"/>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">體溫 (℃)</div>
          <el-input-number v-model="vitalSignsThresh.temp" @change="updateThresh" controls-position="right" size="small" :precision="1" :step="0.1" />

          <!-- <span class="card-panel-num">{{Math.round(vitalSigns.temp*10)/10}}</span> -->
          <!-- <count-to :start-val="0" :end-val="37" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="10" :lg="5" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-spo2">
          <svg-icon icon-class="oxygen" class-name="card-panel-icon" @click="handleSetLineChartData('spo2')" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">血氧濃度 (%)</div>
          <el-input-number v-model="vitalSignsThresh.spo2" @change="updateThresh" controls-position="right" size="small" />

          <!-- <span class="card-panel-num">{{vitalSigns.spo2}}</span> -->
          <!-- <count-to :start-val="0" :end-val="99" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>

    <el-col :xs="10" :sm="10" :lg="4" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-pi">
          <svg-icon icon-class="perfusion" class-name="card-panel-icon" @click="handleSetLineChartData('pi')" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">灌注指標</div>
          <div class="card-panel-text">(%)</div>
          <!-- <el-input-number v-model="vitalSignsThresh.pi" @change="updateThresh" controls-position="right" size="small" :precision="2" :step="0.01"/> -->

          <!-- <span class="card-panel-num">{{Math.round(vitalSigns.pi*100)/100}}</span> -->
          <!-- <count-to :start-val="0" :end-val="10" :duration="3000" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>

    <!-- <el-col :xs="10" :sm="10" :lg="4" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('pi')">
        <div class="card-panel-icon-wrapper icon-bp">
          <svg-icon icon-class="blood-pressure" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            SBP/DBP
          </div>
          <count-to :start-val="0" :end-val="80" :duration="3000" class="card-panel-num" />
          <span class="card-panel-num">/ </span>
          <count-to :start-val="0" :end-val="120" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col> -->
  </el-row>
</template>

<script>
import CountTo from "vue-count-to";

export default {
  components: {
    CountTo,
  },
  props: {
    vitalSignsThresh: {
      type: Object,
      default: null,
      required: true,
    },
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit("handleSetLineChartData", type);
    },
    updateThresh() {
      console.log("this.vitalSignsThresh.hr", this.vitalSignsThresh.hr);
      this.$emit("updateThresh", this.vitalSignsThresh);
    }
  },
};
</script>

<style lang="scss" scoped>
.card-panel-icon-wrapper:focus {
  background: #c940ab;
  .icon-hr {
    background: #c940ab;
  }
}
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-hr {
        background: #40c9c6;
      }

      .icon-temp {
        background: #36a3f7;
      }

      .icon-spo2 {
        background: #f4516c;
      }

      .icon-pi {
        background: #34bfa3;
      }
      .icon-bp {
        background: #63e4f5;
      }
    }

    .icon-hr {
      color: #40c9c6;
    }

    .icon-temp {
      color: #36a3f7;
    }

    .icon-spo2 {
      color: #f4516c;
    }

    .icon-pi {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
        text-align: center;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
