import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/agent/agentList',
    method: 'post',
    data
  })
}

export function addShop(data) {
  return request({
    url: '/agent/addAgent',
    method: 'post',
    data
  })
}

export function editShop(data) {
  return request({
    url: '/agent/editAgent',
    method: 'post',
    data
  })
}

export function delShop(data) {
  return request({
    url: '/agent/delAgent',
    method: 'post',
    data
  })
}
