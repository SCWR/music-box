import React from 'react'
import { connect } from 'react-redux'
import { actionTypes, createAction } from '@/store/action.js'
import shallowequal from 'shallowequal'
import * as PropTypes from 'prop-types'
import classnames from 'classnames'
import Icon from '@/components/Icon.js'
import { Slider, Dropdown, Modal, message } from 'antd'
import MusicList from './MusicList.js'

import api from '@/api/data.js'
import { secondToFormat } from '@/assets/js/toolUtil.js'

import './footer.module.scss'
import CDPlaceHolder from '../assets/image/cd_placeholder.png'

class Footer extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    currSong: PropTypes.number.isRequired,
    volume: PropTypes.number.isRequired,
    playTime: PropTypes.number.isRequired,
    songDetail: PropTypes.bool.isRequired,
    songStatus: PropTypes.bool.isRequired,
    playList: PropTypes.array.isRequired,
    likeSongList: PropTypes.array.isRequired,
    setCurrSong: PropTypes.func.isRequired,
    toggleSongStatus: PropTypes.func.isRequired,
    toggleSongDetail: PropTypes.func.isRequired,
    addLikeSongList: PropTypes.func.isRequired,
    delLikeSongList: PropTypes.func.isRequired,
    setVolume: PropTypes.func.isRequired,
    setPlayTime: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      singer: '',
      time: 0,
      timeStr: '00:00',
      playTime: 0,
      manual: false,
      songUrl: '',
      songImgUrl: CDPlaceHolder
    }
    this.audioRef = React.createRef()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.currSong !== prevProps.currSong) {
      if (this.props.currSong) {
        this.getSongDetail()
        if (this.props.songStatus) {
          this.play(this.props.currSong === prevProps.currSong)
        }
      } else {
        this.clearDetail()
      }
    }
    if (this.props.songStatus !== prevProps.songStatus) {
      if (this.props.songStatus) {
        this.play(this.props.currSong === prevProps.currSong)
      } else {
        this.pause()
      }
    }
  }

  componentDidMount () {
    this.audioRef.current.volume = this.props.volume
    if (this.props.currSong) {
      this.getSongDetail()
      if (this.props.songStatus) {
        this.play()
      }
    } else {
      this.clearDetail()
    }
  }

  prev = () => {
    if (this.props.playList.length > 0) {
      let index = this.props.playList.findIndex(item => item.id === this.props.currSong)
      let prevSong = index === 0 ? this.props.playList[this.props.playList.length - 1] : this.props.playList[index - 1]
      this.props.toggleSongStatus(true)
      this.props.setCurrSong(prevSong.id)
    }
  }

  next = () => {
    if (this.props.playList.length > 0) {
      let index = this.props.playList.findIndex(item => item.id === this.props.currSong)
      let nextSong = (index === this.props.playList.length - 1) ? this.props.playList[0] : this.props.playList[index + 1]
      this.props.toggleSongStatus(true)
      this.props.setCurrSong(nextSong.id)
    }
  }

  async play (sameSong) {
    try {
      let checkMusic = await api.checkMusic({
        id: this.props.currSong
      })
      if (!checkMusic.success) {
        message.info(checkMusic.message)
        this.props.toggleSongStatus(false)
        return
      }
      let getSongUrl = await api.getSongUrl({
        id: this.props.currSong
      })
      if (getSongUrl.code === 200) {
        let song = getSongUrl.data[0]
        this.setState({
          songUrl: song.url
        }, () => {
          if (sameSong) {
            let playTime = this.state.playTime
            this.audioRef.current.currentTime = playTime
          }
          this.audioRef.current.play()
        })
      } else {
        message.error('获取音乐地址失败')
        this.props.toggleSongStatus(false)
      }
    } catch (e) {
      message.error('获取音乐地址失败')
      this.props.toggleSongStatus(false)
    }
  }

  pause () {
    this.audioRef.current.pause()
  }

  clearDetail () {
    this.setState({
      name: '',
      singer: '',
      time: 0,
      playTime: 0,
      timeStr: '00:00',
      songUrl: '',
      manual: false,
      songImgUrl: CDPlaceHolder
    })
    this.props.toggleSongStatus(false)
    this.props.setPlayTime(0)
  }

  volumeFormatter = val => {
    return String(parseInt(val * 100, 10))
  }

  toggleSongDetail = () => {
    if (this.props.currSong) {
      this.props.toggleSongDetail(!this.props.songDetail)
    }
  }

  toggleSongStatus = () => {
    if (this.props.currSong) {
      this.props.toggleSongStatus(!this.props.songStatus)
    }
  }

  getSongDetail () {
    api.getSongDetail({
      ids: String(this.props.currSong)
    }).then(result => {
      if (result.code === 200) {
        let { songs: [song = {}] } = result
        let time = Math.floor((song.dt || 0) / 1000)
        this.setState({
          name: song.name,
          singer: (song.ar || []).map(item => item.name).join(' / '),
          time,
          timeStr: secondToFormat(time),
          songImgUrl: song.al && song.al.picUrl ? `${song.al.picUrl}?param=60y60` : CDPlaceHolder
        })
      }
    }).catch(e => { })
  }

  toggleLike = () => {
    if (this.props.currSong) {
      let like = !!this.props.likeSongList.find(id => id === this.props.currSong)
      if (like) {
        Modal.confirm({
          content: '确定取消喜欢？',
          icon: null,
          centered: true,
          onOk: () => {
            return new Promise((resolve, reject) => {
              this.setState({
                likeLoading: true
              }, () => {
                api.likeSong({
                  like: 'false',
                  id: this.props.currSong
                }).then(result => {
                  if (result.code === 200) {
                    this.props.delLikeSongList(this.props.currSong)
                    message.info('取消喜欢成功')
                    resolve()
                  } else {
                    let err = ''
                    reject(err)
                  }
                  this.setState({
                    likeLoading: false
                  })
                }).catch((e) => {
                  this.setState({
                    likeLoading: false
                  })
                  message.error('取消喜欢失败')
                  console.log(e)
                })
              })
            })
          },
          onCancel: () => { }
        })
      } else {
        this.setState({
          likeLoading: true
        }, () => {
          api.likeSong({
            like: 'true',
            id: this.props.currSong
          }).then(result => {
            if (result.code === 200) {
              this.props.addLikeSongList(this.props.currSong)
              message.info('喜欢成功')
            }
            this.setState({
              likeLoading: false
            })
          }).catch((e) => {
            this.setState({
              likeLoading: false
            })
            message.error('喜欢失败')
            console.log(e)
          })
        })
      }
    }
  }

  toggleVolume = (volumeShow) => {
    this.setState({
      volumeShow
    })
  }

  handleVolumeChange = (volume) => {
    this.audioRef.current.volume = volume
    this.props.setVolume(volume)
  }

  toggleList = (listShow) => {
    this.setState({
      listShow
    })
  }

  playTimeDown = () => {
    this.setState({
      manual: true
    })
  }

  playTimeUp = () => {
    this.setState({
      manual: false
    })
  }

  handleTimeChange = (value) => {
    this.setState({
      playTime: value
    })
  }

  handleTimeAfterChange = (value) => {
    this.setState({
      manual: false
    }, () => {
      this.audioRef.current.currentTime = value
      if (!this.props.songStatus) {
        this.props.toggleSongStatus(true)
      }
    })
  }

  timeUpdate = (e) => {
    let playTime = Math.floor(e.target.currentTime)
    this.props.setPlayTime(playTime)
    if (!this.state.manual) {
      this.setState({
        playTime: playTime
      })
    }
  }

  playEnd = (e) => {
    if (this.props.playList.length === 1) {
      this.audioRef.current.currentTime = 0
      this.audioRef.current.play()
    } else {
      this.next()
    }
  }

  playError = (e) => {
    if (this.state.songUrl) {
      message.error('播放失败')
    }
  }

  render () {
    let like = !!this.props.likeSongList.find(id => id === this.props.currSong)
    let playTime = this.state.manual ? this.state.playTime : this.props.playTime
    return (
      <div styleName='content' >
        <div styleName='icon'>
          <img src={this.state.songImgUrl} alt='' />
          <Icon styleName={classnames(['icon-handle-btn', { 'hidden': !this.props.currSong }])} type={this.props.songDetail ? 'zoom-out' : 'zoom-in'} onClick={this.toggleSongDetail} />
        </div>
        <Icon styleName='music-handle-btn' type='prev' onClick={this.prev} />
        <Icon styleName='music-handle-btn middle-btn' type={this.props.songStatus ? 'stop' : 'play'} onClick={this.toggleSongStatus} />
        <Icon styleName='music-handle-btn' type='next' onClick={this.next} />
        <div styleName='music-content'>
          <div styleName='music-detail'>
            <span styleName='title' ><label>{this.state.name}</label>{this.state.singer && ` - ${this.state.singer}`}</span>
            <span styleName='time'>{secondToFormat(playTime)} / {this.state.timeStr}</span>
          </div>
          <div onMouseDownCapture={this.playTimeDown} onMouseUpCapture={this.playTimeUp}>
            <Slider className='app-slider' disabled={!this.state.time} max={this.state.time || 1} tipFormatter={null} value={playTime} onChange={this.handleTimeChange} onAfterChange={this.handleTimeAfterChange} />
          </div>
        </div>
        <Icon styleName={classnames('handle-btn', { 'like': like })} type={like ? 'heart' : 'line-heart'} onClick={this.toggleLike} />
        <Dropdown placement='topCenter' trigger={['click']} visible={this.state.volumeShow} onVisibleChange={this.toggleVolume} overlay={(
          <div styleName='control-box' >
            <Icon styleName='control-icon' type='volume' />
            <Slider styleName='control-slider' max={1} step={0.01} tipFormatter={this.volumeFormatter} className='app-slider' value={this.props.volume} onChange={this.handleVolumeChange} />
          </div>
        )}>
          <Icon styleName='handle-btn' type='volume' />
        </Dropdown>
        <Dropdown placement='topRight' trigger={['click']} visible={this.state.listShow} onVisibleChange={this.toggleList} overlay={(
          <MusicList check={this.state.listShow} />
        )}>
          <div styleName='list-detail'>
            <Icon styleName='handle-btn' type='list' />
            <span styleName='handle-num'>{this.props.playList.length}</span>
          </div>
        </Dropdown>
        <audio ref={this.audioRef} styleName='audio' src={this.state.songUrl} onTimeUpdate={this.timeUpdate} onEnded={this.playEnd} onError={this.playError} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currSong: state.currSong,
    volume: state.volume,
    playTime: state.playTime,
    songDetail: state.songDetail,
    songStatus: state.songStatus,
    likeSongList: state.likeSongList,
    playList: state.playList
  }
}

const mapDispatchToPorps = dispatch => {
  return {
    setCurrSong: id => {
      dispatch(createAction(actionTypes.SET_CURR_SONG, id))
    },
    toggleSongStatus: isPlay => {
      dispatch(createAction(actionTypes.TOGGLE_SONG_STATUS, isPlay))
    },
    toggleSongDetail: toggle => {
      dispatch(createAction(actionTypes.TOGGLE_SONG_DETAIL, toggle))
    },
    addLikeSongList: id => {
      dispatch(createAction(actionTypes.ADD_LIKE_SONG, id))
    },
    delLikeSongList: id => {
      dispatch(createAction(actionTypes.DEL_LIKE_SONG, id))
    },
    setVolume: volume => {
      dispatch(createAction(actionTypes.SET_VOLUME, volume))
    },
    setPlayTime: playTime => {
      dispatch(createAction(actionTypes.SET_PLAY_TIME, playTime))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToPorps)(Footer)
