import qs from 'qs'

const baseUrl = 'http://localhost:3333' // api from https://github.com/Binaryify/NeteaseCloudMusicApi

function fetchGet (path, data = {}, timestamp) {
  if (timestamp) {
    data.get_timestamp = timestamp
  }
  let params = qs.stringify(data)
  return fetchHandle(fetch(`${baseUrl}${path}${params ? `?${params}` : ''}`, {
    credentials: 'include',
    method: 'GET',
    mode: 'cors'
  }))
}

function fetchPost (path, data, timestamp) {
  return fetchHandle(fetch(`${baseUrl}${path}${timestamp ? `?post_timestamp=${timestamp}` : ''}`, {
    method: 'POST',
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify(data),
    credentials: 'include'
  }))
}

function fetchHandle (fetchInstance) {
  return new Promise((resolve, reject) => {
    fetchInstance.then(res => {
      if (res.status === 200) {
        // debuger
        let result = { code: 500 }
        try {
          result = res.json()
        } catch (e) {
          result = res.text()
        }
        resolve(result)
      } else {
        console.log(res.statusText)
        reject(res.statusText)
      }
    }).catch(e => {
      console.log(e)
      reject(e)
    })
  })
}

const fetchUtil = {
  get: fetchGet,
  post: fetchPost
}
export default fetchUtil
