<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="生理量測紀錄" name="first">
        <div>
          <vital-signs-record
            v-if="isUpdate1"
            :residentId="this.resident._id"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="個人床位資訊" name="second">
        <div v-if="editInfo">
          <edit-info
            :resident="resident"
            @info-mode="changeMode"
            @reload="reload"
          />
        </div>
        <div v-else>
          <resident-info
            v-if="isUpdate2"
            :resident="resident"
            @edit-mode="changeMode"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="睡眠數據" name="third">
        <sleep-event-list v-if="isUpdate3" :residentId="this.resident._id" />
      </el-tab-pane>

      <el-tab-pane label="壓力分佈圖" name="fourth">
        <heatmap v-if="isUpdate4" :residentId="this.resident._id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getResidentInfo } from "@/api/resident";
import VitalSignsRecord from "./components/VitalSignsRecord";
import ResidentInfo from "./components/ResidentInfo";
import EditInfo from "./components/EditInfo";
import SleepEventList from "./components/SleepEventList";
import Heatmap from "./components/Heatmap";

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
  components: {
    ResidentInfo,
    EditInfo,
    VitalSignsRecord,
    SleepEventList,
    Heatmap,
  },
  data() {
    return {
      isUpdate1: true,
      isUpdate2: false,
      isUpdate3: false,
      isUpdate4: false,
      editInfo: false,
      activeName: "first",
      resident: {
        info: {
          name: "",
          gender: "",
          idNumber: "",
          height: "",
          weight: "",
          birthday: "",
        },
        health: "",
        bedNumber: "",
        remark: null,
        thorDevices: [],
        pairsDevice: null,
        _id: "",
      },
    };
  },
  created() {
    this.fetchResident();
  },
  methods: {
    fetchResident() {
      if (this.$route.query.residentId) {
        this.resident._id = this.$route.query.residentId;
        getResidentInfo(this.$route.query.residentId).then((response) => {
          this.resident = response.data;
          console.log("resident ID: " + JSON.stringify(this.resident._id));
        });
      }
    },
    changeMode() {
      this.editInfo = !this.editInfo;
    },
    reload() {
      this.editInfo = false;
      this.fetchResident();
    },
    handleClick(tab) {
      if (tab.name == "first") {
        this.isUpdate1 = true;
        this.isUpdate2 = false;
        this.isUpdate3 = false;
        this.isUpdate4 = false;
      } else if (tab.name == "second") {
        this.isUpdate1 = false;
        this.isUpdate2 = true;
        this.isUpdate3 = false;
        this.isUpdate4 = false;
      } else if (tab.name == "third") {
        this.isUpdate1 = false;
        this.isUpdate2 = false;
        this.isUpdate3 = true;
        this.isUpdate4 = false;
      } else if (tab.name == "fourth") {
        this.isUpdate1 = false;
        this.isUpdate2 = false;
        this.isUpdate3 = false;
        this.isUpdate4 = true;
      }
    },
  },
};
</script>

