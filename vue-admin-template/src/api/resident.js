import request from '@/utils/request'

export function addResident(resident) {
  return request({
    url: 'residents/add',
    method: 'post',
    data: resident
  })
}

export function deleteResident(residentId) {
  return request({
    url: 'residents/' + residentId,
    method: 'delete'
  })
}

export function getResidentInfo(residentId) {
  return request({
    url: 'residents/info/' + residentId,
    method: 'get'
  })
}

export function getResidentList() {
  return request({
    url: 'residents/list',
    method: 'get'
  })
}

export function updateResident(residentId, resident) {
  return request({
    url: 'residents/update/' + residentId,
    method: 'put',
    data: resident
  })
}

export function getResidentSleepRecord(residentId, start, end) {
  return request({
    url: 'residents/sleep/record/' + residentId + '/' + start + '/' + end,
    method: 'get',
  })
}

export function getResidentVitalSignsRecord(residentId, start, end) {
  return request({
    url: 'residents/vital/signs/record/' + residentId + '/' + start + '/' + end,
    method: 'get',
  })
}

export function getResidentTurnOverRecord(timestamp) {
  return request({
    url: 'residents/turn/over/record/' + timestamp,
    method: 'get',
  })
}

export function updateResidentVitalSignsThresh(residentId, thresh) {
  return request({
    url: 'residents/update/vital/signs/thresh/' + residentId,
    method: 'put',
    data: thresh
  })
}


  // export function getResidentVitalSignsRecord(residentId, dateRange) {
  //   console.log("-----------api call:" + JSON.stringify(dateRange));
  //   return request({
  //     url: 'residents/vital/signs/record/' + residentId,
  //     method: 'get',
  //     data: dateRange
  //   })
  // }