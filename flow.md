#### Device send data to Frontend
```sequence
participant Gateway
participant Backend App
participant DB
participant API Server
participant Frontend App

Gateway->Backend App: Send data 
Backend App->DB: Write data
Frontend App->API Server: Get data
API Server->DB: Read data
DB-->API Server:
API Server-->Frontend App:
```

#### Frontend add/delete device
```sequence
participant DB
participant API Server
participant Frontend App


Frontend App->API Server: Add/Delete device
API Server->DB: New/Delete device
DB-->API Server:
API Server-->Frontend App:
```

#### Frontend user register
```sequence
participant DB
participant API Server
participant Frontend App


Frontend App->API Server: User register\nusername / password
API Server->DB: Save 
DB-->API Server:
API Server-->Frontend App: Register success
```

#### Frontend user login
```sequence
participant DB
participant API Server
participant Frontend App


Frontend App->API Server: User login\nusername / password
API Server->DB: Authenticate 
DB-->API Server:
API Server-->Frontend App: Authenticate success
```

