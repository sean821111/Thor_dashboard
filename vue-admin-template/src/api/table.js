import request from '@/utils/request'

export function getList(params) {
  return request({
    url: 'datas/list',
    method: 'get',
    params
  })
}
