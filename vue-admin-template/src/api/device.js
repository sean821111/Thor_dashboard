import request from '@/utils/request'

export function getDeviceList() {
  return request({
    url: 'thor/devices/list',
    method: 'get'
  })
}

export function addDevice(device) {
  return request({
    url: 'thor/devices/add',
    method: 'post',
    data: device
  })
}

export function deleteDevice(name) {
  return request({
    url: 'thor/devices/' + name,
    method: 'delete'
  })
}

export function getVitalSign(name) {
  return request({
    url: 'thor/devices/vital/signs/' + name,
    method: 'get'
  })
}

export function updateVitalSign(name) {
  return request({
    url: 'thor/devices/vital/sign/' + name,
    method: 'put'
  })
}
