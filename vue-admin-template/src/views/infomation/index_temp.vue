<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="個人床位資訊" name="first">
        <div class="info-container">
          <el-row>
            <h1>101床-住民床位資訊</h1>

            <el-button
              v-if="editInfo"
              type="success"
              icon="el-icon-circle-check-outline"
              style="float: right"
              @click="confirmEdit"
            >
              儲存
            </el-button>

            <el-button
              v-if="!editInfo"
              type="primary"
              icon="el-icon-edit"
              style="float: right"
              @click="handleEdit"
              >編輯資訊</el-button
            >
            <el-button
              v-if="editInfo"
              class="cancel-btn"
              icon="el-icon-refresh"
              type="warning"
              style="float: right"
              @click="cancelEdit"
            >
              取消
            </el-button>
          </el-row>
          <el-row>
            <el-col :span="4">
              <h2>住民資訊</h2>
            </el-col>
            <el-col :span="4">
              <h2>住民身體狀況</h2>
            </el-col>
            <el-col :span="4">
              <h2>裝置資訊</h2>
            </el-col>
            <el-col :span="4">
              <h2>特殊需求及注意事項</h2>
            </el-col>
          </el-row>

          <el-row border>
            <el-col :span="4">
              <div class="divclass" v-show="!editInfo">
                姓名：{{ form.name }}
              </div>
              <div class="divclass" v-show="!editInfo">
                性別：{{ form.gender }}
              </div>
            </el-col>

            <el-col :span="4">
              <span v-show="!editInfo">翻身次數{{ form.turn_over_times }}</span>
            </el-col>

            <el-col :span="4"> </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="個別床位事件紀錄" name="second">
        <div><event-record /></div>
      </el-tab-pane>

      <el-tab-pane label="個別紀錄範圍" name="third">個別紀錄範圍</el-tab-pane>
    </el-tabs>
  </div>
</template>


<script>
// import { mapGetters } from "vuex";
import EventRecord from "./component/EventRecord";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        processed: "success",
        unprocessed: "danger",
      };
      return statusMap[status];
    },
  },
  components: { EventRecord },
  data() {
    return {
      editInfo: false,
      form: {
        name: "Test",
        gender: 1,
        ID: "A123456789",
        height: 175,
        weight: 80,
        birthday: "1957/03/06",
        bed_num: 101,
        device_num: 1010,
        turn_over_times: 2,
      },
      tableData: [
        {
          date: "2016-05-02",
          event: "起床",
          start_time: "上海",
          end_time: "普陀区",
          during: "03:06",
          status: "processed",
        },
        {
          date: "2016-05-04",
          event: "下床",
          start_time: "上海",
          end_time: "普陀区",
          during: "01:21",
          status: "unprocessed",
        },
        {
          date: "2016-05-01",
          event_status: "王小虎",
          start_time: "上海",
          end_time: "普陀区",
          during: "01:46",
          status: "processed",
        },
      ],
    };
  },

  methods: {
    handleEdit() {
      this.editInfo = true;
    },
    cancelEdit() {
      this.editInfo = false;
    },
    confirmEdit() {},
  },
};
</script>

<style scoped>
.info-container {
  border-left: 1px solid;
  border-right: 1px solid;
  border-color: #cccccc;
}
.resident-info >>> .el-form-item__label {
  font-size: 16px;
}
.grid-content {
  min-height: 8px;
  /* background-color: #f9fafc; */
}
.el-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  column-span: 4;
}

.divclass {
  line-height: 40px;
}
</style>

