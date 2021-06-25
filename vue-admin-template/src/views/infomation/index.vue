<template>
  <div>
    <p>{{this.$route.query.residentId}}</p>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="個人床位資訊" name="first">
          <el-button type="primary" icon="el-icon-edit" style="float: right" @click="editPage">
            編輯資訊
          </el-button>
        <div><resident-info /></div>
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
// import EditInfo from ".component/EditInfo"

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
  components: { EventRecord, ResidentInfo },
  data() {
    return {
      editInfo: false,
      device: null,
     
    };
  },
   created(){
      this.fetchResident();
  },
  methods: {
    fetchResident() {
        getResidentInfo("60b5e450d9ddc5d631dc9ece").then((response)=> {
            this.info = response.data.info;
            // this.info.birthday = new Date(info.birthday).substring(0,10);
            this.device = response.data.device;
            this.health = response.data.health;
            this.bedNumber = response.data.bedNumber;
            console.log("get resident info")
            console.log(response.data)
            this.residentData = response.data;
            
        });
    },
    editPage() {
      this.$router.push({ path: this.redirect || "/infomation/edit", query:{ residentId: this.device._id }});
      
    },
    cancelEditPage(){
      this.$router.push({ path: this.redirect || "/infomation/index", query:{ residentId: this.device._id }});
    }
  },
};
</script>

