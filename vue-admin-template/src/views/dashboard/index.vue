<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      name: {{ name }}
      <el-button
        type="primary"
        icon="el-icon-plus"
        circle
        @click="handleAddDevice"
      />
      <el-row>
        <!-- use keyup instead of keydown, only my computer can't use -->
        <el-input
          v-model="search"
          clearable
          placeholder="床號或姓名....."
          auto-complete="on"
          size="small"
          @keydown.enter.native="handleSearchDevice"
          @input="handleRecoverDevice"
        />
      </el-row>
    </div>
    <el-row :gutter="20">
      <el-col v-for="device in devices" :key="device.name" :span="6">
        <device :device="device" @delete-device="handleDeleteDevice" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Device from "./components/Device";
import { getDeviceList, addDevice, deleteDevice, getVitalSign} from "@/api/device";

export default {
  name: "Dashboard",
  components: {
    Device,
  },
  data() {
    return {
      devices: null,
      backup: null,
      search: null,
      vitalSign: null,
      formInline: {
        user: "",
        region: "",
      },
    };
  },
  computed: {
    ...mapGetters(["name"]),
  },
  created() {
    this.fetchDeviceData();
  },
  methods: {
    fetchDeviceData() {
      getDeviceList().then((response) => {
        this.devices = response.data;
        console.log("get device: "+JSON.stringify(this.devices));
      });

      
    },


    handleAddDevice() {
      console.log("Add device");
      const device = {
        name: "Thor2_" + (this.devices.length + 1).toString(),
      };
      addDevice(device).then((response) => {
        this.fetchDeviceData();
      });
    },
    handleDeleteDevice({ name }) {
      console.log("Delete device: " + name);
      deleteDevice(name).then((response) => {
        console.log(response);
        this.fetchDeviceData();
      });
    },
    handleSearchDevice() {
      console.log("handleSearchDevice");
      console.log(this.search);
      this.backup = Array.from(this.devices);
      
      this.devices = this.devices.filter(
        (device) =>
          device.name === this.search || (device.resident && device.resident.bedNumber === this.search)
      );
    },
    handleRecoverDevice() {
      if (!this.search && this.backup != null) {
        console.log("handleRecoverDevice");
        this.devices = Array.from(this.backup);
        this.backup = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.el-col {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-input {
  width: 300px;
}
</style>
