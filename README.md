# Thor_dashboard
Vital signs dashboard for Thor, an ear type wearable device.

![Thor_dathaboard_main](https://imgur.com/V7JYSWQ.png)

![vital_sign_history](https://imgur.com/PxnOjvz.png)


## Installing Node.js and npm from NodeSource

1. Enable the NodeSource repository by running the following curl command as a user with sudo privileges :

    ```bash
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    ```

2. Once the NodeSource repository is enabled, install Node.js and npm by typing:

    ```bash
    sudo apt install nodejs
    ```

3. Verify that the Node.js and npm were successfully installed by printing their versions:

    ```bash
    node --version
    ```

## mongodb

[mongo](https://hub.docker.com/_/mongo)

### via docker-compose deploy

Example stack.yml for mongo:

```yaml
# Use root/example as user/password credentials
version: '3.1'

services:

  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
```

```bash
docker-compose -f stack.yml up
```

## nodemon

nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.

[nodemon](https://www.npmjs.com/package/nodemon)

## install vue-cli

```bash
npm install -g @vue/cli
```

# Getting started

```bash
# enter the backend directory
cd backend

# install dependency
npm install

# running backend
npm run start
```

```bash
# enter the project directory
cd vue-element-admin

# install dependency
npm install

# develop
npm run dev
```


