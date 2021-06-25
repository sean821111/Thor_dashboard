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

export function updateResident(residentId, resident) {
  return request({
    url: 'residents/update/' + residentId,
    method: 'put',
    data: resident
  })
}

export function getResidentSleepRecord(residentId, dateRange) {
    return request({
      url: 'residents/sleep/record/' + residentId,
      method: 'get',
      data: dateRange
    })
  }


