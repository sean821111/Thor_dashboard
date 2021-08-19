import Vue from 'vue';
// import App from './App.vue';
// import views from '/heatmap/index.vue';

import heatmap from 'vue-heatmapjs';
import * as filters from './filters' // global filters



// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

new Vue({
  el: '#app',
  render: h => h(App)
});

Vue.use(heatmap, {
  // Fired on every click and mousemove.
  // data is an object with xy positions and heat value.
  // It would be a good idea to combine and throttle these before sending.
  afterAdd(data) {
    // Send the data here.
    logUserInteractions(data);
  }
});
