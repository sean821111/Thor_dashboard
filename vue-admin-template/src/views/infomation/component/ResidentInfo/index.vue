<template>
    <div class="grid-container">
        <div class="header">
            <span style="float:left;">
              <h1>{{this.resident.bedNumber}}床-住民床位資訊</h1>
            </span>
            <span style="float:right;">
              <el-button type="primary" icon="el-icon-edit" @click="editMode">
                編輯資訊
              </el-button> 
            </span> 
        </div>
        

        <div class="info-content">
            <h2>住民資訊</h2>
                <div class="grid-content">姓名：{{ this.resident.info.name }}</div>
                <div class="grid-content">性別：{{ this.resident.info.gender }}</div>
                <div class="grid-content">身份證：{{ this.resident.info.idNumber }}</div>
                <div class="grid-content" >身高：{{ this.resident.info.height }} cm</div>
                <div class="grid-content" >體重：{{ this.resident.info.weight }} kg</div>
                <div class="grid-content">出生日期：{{ new Date(this.resident.info.birthday).toLocaleDateString() }}</div>
        </div>
        <div class="condition">
            <h2>住民身體狀況</h2>
            <div class="grid-content">身體狀況：{{ this.resident.health }}</div>
        </div>

        <div class="device-info">
            <h2>裝置資訊</h2>
            <div class="grid-content">床號：{{ this.resident.bedNumber }}</div>

            <div class="grid-content">Thor裝置1：{{ (this.resident.thorDevices.length > 0) ? this.resident.thorDevices[0].name : "null" }}</div>
            <div class="grid-content">Thor裝置2：{{ (this.resident.thorDevices.length > 1) ? this.resident.thorDevices[1].name : "null" }}</div>
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
    };
  },
  props: {
    resident: {
      type: Object,
      default: null,
      required: true,
    }
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
    editMode() {
      this.$emit("edit-mode");
    },
    
    
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