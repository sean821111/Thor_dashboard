<template>
  <div>
    <p>{{this.$route.query.residentId}}</p>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="個人床位資訊" name="first">
        
        <div v-if="editInfo"><edit-info :resident="resident" @info-mode="changeMode" @reload="reload"/></div>
        <div v-else><resident-info :resident="resident" @edit-mode="changeMode"/></div>
      </el-tab-pane>

      <el-tab-pane label="個別床位事件紀錄" name="second">
        <div><event-record /></div>
      </el-tab-pane>

      <!-- <el-tab-pane label="個別紀錄範圍" name="third">個別紀錄範圍</el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import {getResidentInfo} from "@/api/resident"
import EventRecord from "./component/EventRecord";
import ResidentInfo from "./component/ResidentInfo";
import EditInfo from "./component/EditInfo"

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
  components: { EventRecord, ResidentInfo, EditInfo },
  data() {
    return {
      editInfo: false,
      activeName: 'first',
      resident: {
        info: {
          name:'',
          gender:'',
          idNumber:'',
          height:'',
          weight:'',
          birthday:'',
        },
        health:'',
        bedNumber:'',
        remark: null,
        thorDevices: [],
        pairsDevice: null
      }
    };
  },
  created(){
      this.fetchResident();
  },
  methods: {
    fetchResident() {
<<<<<<< HEAD
=======
      if (this.$route.query.residentId) {
>>>>>>> 9bcc7f59f6f36a51b98c0be957b5b3a5939c7f12
        getResidentInfo(this.$route.query.residentId).then((response)=> {
            this.resident = response.data            
            console.log("resident: " + JSON.stringify(this.resident));
        });
      }
    },
    changeMode() {
      this.editInfo = !this.editInfo;
    },
    reload() {
      this.editInfo = false;
      this.fetchResident();
    }
  }
};
</script>

