<template>
  <div>
    <radial-progress-bar
      :diameter="250"
      :completed-steps="chartValue"
      :total-steps="totalSteps"
      :startColor="startColor"
      :stopColor="stopColor"
      :strokeWidth="25"
      :innerStrokeWidth="25"
    >
      <!-- <svg-icon icon-class="day" class="icon-class" /> -->
      <span class="value-class">{{ chartValue }}</span>
      <span class="title-wrapper">{{ chartTitle }}</span>
    </radial-progress-bar>
  </div>
</template>

<script>
import RadialProgressBar from "vue-radial-progress";

export default {
  data() {
    return {
      //   completedSteps: 3,
      totalSteps: 100,
      stopColor: "#ea08ff93",
      startColor: "#eb5c19",
    };
  },
  props: {
    chartTitle: {
      type: String,
      required: true,
    },
    chartValue: {
      type: Number,
      required: true,
    },
  },

  components: {
    RadialProgressBar,
  },
};
</script>

<style scoped>
.title-wrapper {
  margin-bottom: 5px;
  font-size: 25px;
}
.value-class {
  font-size: 70px;
  font-weight: bold;
  color: #eb5c19;
}
.icon-class {
  height: 3em;
  width: 3em;
}
</style>