<template>
    <div class="grid-container">
        <div class="header">
            <h1>{{bedNumber}}床-住民床位資訊</h1>
            
        </div>

        <div class="info-content">
            <h2>住民資訊</h2>
                <div class="grid-content">姓名：{{ info.name }}</div>
                <div class="grid-content">性別：{{ info.gender }}</div>
                <div class="grid-content">身份證：{{ info.idNumber }}</div>
                <div class="grid-content" >身高：{{ info.height }} cm</div>
                <div class="grid-content" >體重：{{ info.weight }} kg</div>
                <div class="grid-content">出生日期：{{ info.birthday }}</div>
        </div>
        <div class="condition">
            <h2>住民身體狀況</h2>
            <div class="grid-content">身體狀況：{{ health }}</div>
        </div>

        <div class="device-info">
            <h2>裝置資訊</h2>
            <div class="grid-content">床號：{{ bedNumber }}</div>

              <div class="grid-content">儀器編號：{{ device.name }}</div>
        </div>
    </div>
</template>


<script>
import {getResidentInfo} from "@/api/resident"


export default {
  name: "ResidentInfo",
  data() {
    return {
    
      editInfo: false,
      info: null,
      device: null,
      health: null,
      bedNumber: null,
      residentData: null,
    };
  },
  created(){
      this.fetchResident();
  },
  methods: {
    handleEdit() {
      this.editInfo = true;
    },
    cancelEdit() {
      this.editInfo = false;
    },
    confirmEdit() {
    },

    fetchResident() {
        getResidentInfo("60b5e450d9ddc5d631dc9ece").then((response)=> {
            this.info = response.data.info;
            // this.info.birthday = new Date(info.birthday).substring(0,10);
            this.device = response.data.device;
            this.health = response.data.health;
            this.bedNumber = response.data.bedNumber;
            this.residentData = response.data;
            
        });
    }
  }
}

</script>

<style scoped>
.grid-content {
  min-height: 8px;
  line-height: 40px;
  font-size: 20px;
  /* background-color: #f9fafc; */
}

.grid-container {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1.5fr;
  grid-template-rows: 0.4fr 1.7fr;
  gap: 3px 10px;
  grid-template-areas:
    "header header header"
    "info-content condition device-info";
}

.header {
  grid-area: header;
}

.info-content {
  grid-area: info-content;
  background: #def;
  border: 1px solid silver;
  display: inline-block;
  box-shadow: 4px 4px 3px rgba(20%, 20%, 40%, 0.5);
  /* background-color: rgb(231, 166, 81); */
}

.condition {
  grid-area: condition;
  background: #def;
  border: 1px solid silver;
  display: inline-block;
  box-shadow: 4px 4px 3px rgba(20%, 20%, 40%, 0.5);
}
.device-info {
  grid-area: device-info;
  background: #def;
  border: 1px solid silver;
  display: inline-block;
  box-shadow: 4px 4px 3px rgba(20%, 20%, 40%, 0.5);
}
</style>