<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      name: {{ name }}
      <!-- <el-button
        type="primary"
        icon="el-icon-plus"
        circle
        @click="handleAddDevice"
      /> -->
      <el-button type="success" @click="addResident" v-permission="['admin']"
        >新增住民</el-button
      >
      <el-row>
        <!-- use keyup instead of keydown, only my computer can't use -->
        <el-input
          v-model="search"
          clearable
          placeholder="床號或姓名....."
          auto-complete="on"
          size="small"
          @keydown.enter.native="handleSearchResident"
          @input="handleRecoverResident"
        />
      </el-row>
    </div>
    <el-row :gutter="20">
      <el-col
        v-for="resident in residents"
        :key="resident.info.idNumber"
        :xs="15"
        :sm="10"
        :md="10"
        :lg="6"
      >
        <resident
          :resident="resident"
          ref="residents"
          @delete-resident="handleDeleteResident"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Resident from "./components/Resident";
import { getResidentList, deleteResident } from "@/api/resident";

// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

export default {
  name: "Dashboard",
  components: {
    Resident,
  },
  data() {
    return {
      devices: null,
      residents: null,
      isSearching: false,
      search: null,
      vitalSign: null,
      formInline: {
        user: "",
        region: "",
      },
    };
  },
  sse: {
    cleanup: true,
  },
  computed: {
    ...mapGetters(["name"]),
  },
  created() {
    this.fetchResidentList();
  },
  mounted() {
    sseClient = this.$sse.create({
      url: process.env.VUE_APP_BASE_API + "/device/update",
      format: "json",
      polyfill: true,
      withCredentials: false,
    });

    // Catch any errors (ie. lost connections, etc.)
    sseClient.on("error", (e) => {
      console.error("lost connection or failed to parse!", e);

      // If this error is due to an unexpected disconnection, EventSource will
      // automatically attempt to reconnect indefinitely. You will _not_ need to
      // re-add your handlers.
    });

    // Handle messages without a specific event
    sseClient.on("message", this.handleMessage);

    sseClient
      .connect()
      .then((sse) => {
        console.log("We're connected!");

        // Unsubscribes from event-less messages after 7 seconds
        // setTimeout(() => {
        //   sseClient.off('UPDATE_DEIVCE', this.handleMessage);
        //   console.log('Stopped listening to event-less messages!');
        // }, 7000);
      })
      .catch((err) => {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error("Failed to connect to server", err);
      });
  },
  methods: {
    fetchResidentList() {
      console.log("fetchResidentList");
      getResidentList().then((response) => {
        this.residents = response.data;
        // console.log("get device: "+JSON.stringify(this.devices));
      });
    },
    handleDeleteResident({ id }) {
      console.log("Delete resident: " + id);
      deleteResident(id).then((response) => {
        console.log(response);
        this.residents = this.residents.filter(
          (resident) => resident._id !== id
        );
      });
    },
    handleSearchResident() {
      console.log("handleSearchResident");
      console.log(this.search);

      var result = this.residents.filter(
        (resident) =>
          resident.info.name === this.search ||
          resident.bedNumber === this.search
      );
      if (result.length != this.residents.length) {
        this.residents = result;
        this.isSearching = true;
      }
    },
    handleRecoverResident() {
      if (!this.search && this.isSearching) {
        console.log("handleRecoverResident");
        this.isSearching = false;
        this.fetchResidentList();
      }
    },
    findResidentDevice(deviceName) {
      var device = null;
      for (var i = 0; i < this.residents.length; i++) {
        let resident = this.residents[i];
        for (var j = 0; j < resident.thorDevices.length; j++) {
          if (resident.thorDevices[j].name === deviceName) {
            device = resident.thorDevices[j];
            return { device: device, index: i, deviceIndex: j };
          }
        }
      }
      return { device: device, index: -1, deviceIndex: -1 };
    },
    handleMessage(message) {
      console.warn("Received a message w/o an event!", message);
      if (message != "initial") {
        console.log("Received a json");
        JSON.parse(JSON.stringify(message));
        // let device = this.devices.find(element => element.name === message.name);
        let result = this.findResidentDevice(message.name);
        if (result.device) {
          if ("isConnected" in message) {
            console.log("isConnected");
            result.device.isConnected = message.isConnected;
            if (message.isConnected) {
              if (
                this.$refs.residents[result.index].getActiveDeviceIndex() == -1
              )
                this.$refs.residents[result.index].resetActiveDevice();
            } else {
              if (
                this.$refs.residents[result.index].getActiveDeviceIndex() ==
                result.deviceIndex
              )
                this.$refs.residents[result.index].resetActiveDevice();
              this.$refs.residents[result.index].clearVitalSigns(
                result.deviceIndex
              );
            }
          } else if ("vitalSigns" in message) {
            console.log("vitalSigns");
            result.device.vitalSigns = message.vitalSigns;
          } else if ("resident" in message) {
            console.log("resident");
            this.residents[result.index].thorDevices.splice(
              result.deviceIndex,
              1
            );
          }
        }
      }
    },
    addResident() {
      this.$router.push({ path: this.redirect || "/infomation/addRes" });
    },
  },
  // mounted(){
  //     this.fetchDeviceData();
  // },
  // cron:{
  //     time:120000,
  //     method:'fetchDeviceData'
  // }
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
