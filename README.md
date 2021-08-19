# Thor_dashboard
The integrated dashboard for monitor vital signs and sleeping quality.

## Description
There are two devices, Thor and Paris(Wistron VCC copyright) transmit data by BLE gateway.
Thor, an ear type wearable device for monitor four medical index, heart rate, temperature, SpO2 and perfusion index.
Paris, pressure pad for measure the sleeping quality and analyse sleeping event.

![Thor_dathaboard_main](https://imgur.com/iMJFy3N.png)

![heatmap](https://imgur.com/97a34K3.png)


# Getting started
clone this project and install docker-compose

For linux ruuning following command.
```bash
# enter the directory
cd Thor_dashboard

# Building project
docker-compose build

# Up container
docker-compose up
```

For windows10 ruuning following command. 
Select the specific docker compose file, especially for intel pentium CPU since the mongo 5.0.0 version is not supported.
We also encounter volume mount problem when we mount to outside folder would cause failed on windows.
```bash
# enter the directory
cd Thor_dashboard

# Building project
docker-compose -f docker-compose-win10.yml build

# Up container
docker-compose -f docker-compose-win10.yml up
```

