import Vue from 'vue';
// import App from './App.vue';
import views from '/heatmap/index.vue';
import heatmap from 'vue-heatmapjs';

Vue.use(heatmap, {
  // Fired on every click and mousemove.
  // data is an object with xy positions and heat value.
  // It would be a good idea to combine and throttle these before sending.
  afterAdd(data) {
    // Send the data here.
    logUserInteractions(data);
  }
});

new Vue({
  el: '#app',
  render: h => h(App)
});