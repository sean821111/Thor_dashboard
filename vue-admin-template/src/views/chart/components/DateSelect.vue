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
          <el-col :xs="1.5" :sm="1.5" :md="1.5" :lg="1.5" style="padding:3px 3px 3px;margin-bottom:10px;">日期區間</el-col>
          <el-col :xs="18" :sm="12" :md="10" :lg="7" style="margin-bottom:10px;">
                <el-date-picker
                v-model="dateRange"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions2">
                </el-date-picker>
          </el-col>
          <el-col :xs="3" :sm="3" :md="3" :lg="3" >
            <el-button type="primary" @click="dateSubmit">確認</el-button>
          </el-col>
        </el-row>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        pickerOptions2: {
          shortcuts: [{
            text: '最近一週',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一個月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三個月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        value6: '',
        dateRange: ''
      };
    },
    methods: {
      dateSubmit(){
        if (this.dateRange ==''){
            this.$message({
                message: '請選擇時間！',
                type: 'warning'
            });
        } else {
            this.$emit('dateSubmit', this.dateRange);
            console.log("date select: "  + this.dateRange[0].toISOString());
        }
        
      }
    }

  };
</script>