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
              v-else
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
            <el-col :span="5">
              <h2>住民資訊</h2>
            </el-col>
            <el-col :span="5">
              <h2>住民身體狀況</h2>
            </el-col>
            <el-col :span="5">
              <h2>裝置資訊</h2>
            </el-col>
            <el-col :span="5">
              <h2>特殊需求及注意事項</h2>
            </el-col>
          </el-row>
          <el-form
            class="resident-info"
            ref="form"
            :model="form"
            label-width="100px"
          >
            <el-row>
              <el-col :span="5">
                <div v-if="editInfo">
                  <el-form-item label="姓名：">
                    <el-input
                      style="width: 100px"
                      v-model="form.name"
                      v-show="editInfo"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>姓名：{{ form.name }}</div>

                <div v-if="editInfo">
                  <el-form-item label="性別：">
                    <el-radio v-model="form.gender" label="1">男</el-radio>
                    <el-radio v-model="form.gender" label="2">女</el-radio>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>性別：{{ form.gender }}</div>

                <div v-if="editInfo">
                  <el-form-item label="身份證：">
                    <el-input
                      style="width: 150px"
                      v-model="form.ID"
                      v-show="editInfo"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>身份證：{{ form.ID }}</div>

                <div v-if="editInfo">
                  <el-form-item label="身高：">
                    <el-input
                      style="width: 80px"
                      v-model="form.height"
                      v-show="editInfo"
                    >
                    </el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>
                  身高：{{ form.height }} cm
                </div>

                <div v-if="editInfo">
                  <el-form-item label="體重：">
                    <el-input
                      style="width: 80px"
                      v-model="form.weight"
                      v-show="editInfo"
                    >
                    </el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>
                  體重：{{ form.weight }} kg
                </div>

                <div v-if="editInfo">
                  <el-form-item label="出生日期:">
                    <el-date-picker
                      style="width: 160px"
                      type="date"
                      v-model="form.birthday"
                      v-show="editInfo"
                    ></el-date-picker>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>
                  出生日期：{{ form.birthday }}
                </div>
              </el-col>

              <el-col :span="5">
                <div v-if="editInfo">
                  <el-form-item label="翻身次數：">
                    <el-input
                      style="width: 60px"
                      v-model="form.turn_over_times"
                      v-show="editInfo"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>
                  翻身次數：{{ form.turn_over_times }}
                </div>
              </el-col>

              <el-col :span="5">
                <div v-if="editInfo">
                  <el-form-item label="床號：">
                    <el-input
                      style="width: 80px"
                      v-model="form.bed_num"
                      v-show="editInfo"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>床號：{{ form.bed_num }}</div>

                <div v-if="editInfo">
                  <el-form-item label="儀器編號：">
                    <el-input
                      style="width: 80px"
                      v-model="form.device_num"
                      v-show="editInfo"
                    ></el-input>
                  </el-form-item>
                </div>
                <div class="grid-content" v-else>
                  儀器編號：{{ form.device_num }}
                </div>
              </el-col>
            </el-row>
          </el-form>
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
  line-height: 40px;
  font-size: 20px;
  /* background-color: #f9fafc; */
}
.el-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
.divclass {
  line-height: 40px;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1.1fr 0.9fr;
  grid-template-rows: 0.3fr 1.7fr 1fr;
  gap: 0px 0px;
  grid-template-areas:
    "title title title ."
    "info situation device-info ."
    ". . . .";
}

.title {
  grid-area: title;
}

.info {
  grid-area: info;
}

.situation {
  grid-area: situation;
}

.device-info {
  grid-area: device-info;
}
</style>

