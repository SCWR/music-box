import fetchUtil from '@/assets/js/fetchUtil.js'
// api from https://binaryify.github.io/NeteaseCloudMusicApi

function getFetchInstance (path, data = {}, { method = 'post' } = { method: 'post' }) {
  return fetchUtil[method](path, data, Date.now())
}

export default {
  loginCellphone: (data) => getFetchInstance('/login/cellphone', data, { method: 'get' }),
  getUserDetail: (data) => getFetchInstance('/user/detail', data, { method: 'get' }),
  logout: () => getFetchInstance('/logout', {}, { method: 'get' }),
  getUserPlayList: (data) => getFetchInstance('/user/playlist', data),
  getLikeList: (data) => getFetchInstance('/likelist', data),
  getPlayListDetail: (data) => getFetchInstance('/playlist/detail', data),
  playListSubscribe: (data) => getFetchInstance('/playlist/subscribe', data),
  likeSong: (data) => getFetchInstance('/like', data),
  getSongDetail: (data) => getFetchInstance('/song/detail', data),
  getSongLyric: (data) => getFetchInstance('/lyric', data),
  getSongUrl: (data) => getFetchInstance('/song/url', data, { method: 'get' }),
  checkMusic: (data) => getFetchInstance('/check/music', data, { method: 'get' }),
  search: (data) => getFetchInstance('/search', data),
  searchHot: (data) => getFetchInstance('/search/hot', data, { method: 'get' }),
  getCatList: () => getFetchInstance('/playlist/catlist', {}, { method: 'get' }),
  getPlayList: (data) => getFetchInstance('/top/playlist', data)
}
