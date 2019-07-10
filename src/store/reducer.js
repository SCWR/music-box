import { combineReducers } from 'redux'
import { actionTypes } from './action.js'

const userId = (state = 0, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return action.payload
    default:
      return state
  }
}

// 29307040 29307041
const currSong = (state = 0, action) => {
  switch (action.type) {
    case actionTypes.SET_CURR_SONG:
      return action.payload
    default:
      return state
  }
}

const volume = (state = 1, action) => {
  switch (action.type) {
    case actionTypes.SET_VOLUME:
      return action.payload
    default:
      return state
  }
}

const playTime = (state = 0, action) => {
  switch (action.type) {
    case actionTypes.SET_PLAY_TIME:
      return action.payload
    default:
      return state
  }
}

const songStatus = (state = false, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_SONG_STATUS:
      return action.payload
    default:
      return state
  }
}

const songDetail = (state = false, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_SONG_DETAIL:
      return action.payload
    default:
      return state
  }
}

const playList = (state = [], action) => {
  switch (action.type) {
    case actionTypes.SET_PLAY_SONG_LIST:
      return action.payload
    case actionTypes.ADD_PLAY_SONG:
      if (action.payload && !state.some(item => item.id === action.payload.id)) {
        return [action.payload, ...state]
      }
      return [...state]
    case actionTypes.DEL_PLAY_SONG:
      return state.filter(item => item.id !== action.payload)
    default:
      return state
  }
}

const likeSongList = (state = [], action) => {
  switch (action.type) {
    case actionTypes.SET_LIKE_SONG_LIST:
      return action.payload
    case actionTypes.ADD_LIKE_SONG:
      if (action.payload) {
        return [action.payload, ...state.filter(item => item !== action.payload)]
      }
      return [...state]
    case actionTypes.DEL_LIKE_SONG:
      return state.filter(item => item !== action.payload)
    default:
      return state
  }
}

const songList = (state = [], action) => {
  switch (action.type) {
    case actionTypes.SET_SONG_LIST:
      return action.payload
    case actionTypes.ADD_SONG_LIST:
      if (action.payload && !state.some(item => item.id === action.payload.id)) {
        return [action.payload, ...state]
      }
      return [...state]
    case actionTypes.DEL_SONG_LIST:
      return state.filter(item => item.id !== action.payload)
    default:
      return state
  }
}

const suggestList = (state = [], action) => {
  switch (action.type) {
    case actionTypes.SET_SUGGEST_LIST:
      return action.payload
    case actionTypes.ADD_SUGGEST:
      if (action.payload) {
        return [action.payload, ...state.filter(item => item !== action.payload)]
      }
      return [...state]
    case actionTypes.DEL_SUGGEST:
      return state.filter(item => item !== action.payload)
    default:
      return state
  }
}

const reducers = combineReducers({
  userId,
  currSong,
  volume,
  playTime,
  songStatus,
  songDetail,
  playList,
  likeSongList,
  songList,
  suggestList
})

export default reducers
