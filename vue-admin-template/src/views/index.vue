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

// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient;

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
  sse: {
    cleanup: true,
  },
  computed: {
    ...mapGetters(["name"]),
  },
  created() {
    this.fetchDeviceData();
  },
  mounted() {
    sseClient = this.$sse.create({
      url: process.env.VUE_APP_BASE_API + '/device/update',
      format: 'json',
      polyfill: true,
      withCredentials: false,
    });

    // Catch any errors (ie. lost connections, etc.)
    sseClient.on('error', (e) => {
      console.error('lost connection or failed to parse!', e);

      // If this error is due to an unexpected disconnection, EventSource will
      // automatically attempt to reconnect indefinitely. You will _not_ need to
      // re-add your handlers.
    });

    // Handle messages without a specific event
    sseClient.on('message', this.handleMessage);

    sseClient.connect()
      .then(sse => {
        console.log('We\'re connected!');

        // Unsubscribes from event-less messages after 7 seconds
        // setTimeout(() => {
        //   sseClient.off('UPDATE_DEIVCE', this.handleMessage);
        //   console.log('Stopped listening to event-less messages!');
        // }, 7000);
      })
      .catch((err) => {
        // When this error is caught, it means the initial connection to the
        // events server failed.  No automatic attempts to reconnect will be made.
        console.error('Failed to connect to server', err);
      });
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
    handleMessage(message) {
      console.warn('Received a message w/o an event!', message);
      if (message != "initial") {
        console.log('Received a json');
        JSON.parse(JSON.stringify(message));
        let device = this.devices.find(element => element.name === message.name);
        if ('isConnected' in message) {
          console.log('isConnected');
          device.isConnected = message.isConnected;
        } else if ('vitalSigns' in message) {
          console.log('vitalSigns');
          device.vitalSigns = message.vitalSigns;
        } if ('resident' in message) {
          console.log('resident');
          device.resident = message.resident;
        }
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
