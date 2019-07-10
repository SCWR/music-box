import React from 'react'
import { connect } from 'react-redux'
import shallowequal from 'shallowequal'
import classnames from 'classnames'
import qs from 'qs'
import moment from 'moment'
import { Modal, message } from 'antd'

import * as PropTypes from 'prop-types'
import Icon from '@/components/Icon.js'

import { actionTypes, createAction } from '@/store/action.js'

import api from '@/api/data.js'
import { secondToFormat } from '@/assets/js/toolUtil.js'

import './songListDetail.module.scss'
import CDPlaceHolder from '../assets/image/cd_placeholder.png'

class SongListDetail extends React.Component {
  static defaultProps = {
    listId: 0,
    isOwner: false
  }

  static propTypes = {
    currSong: PropTypes.number.isRequired,
    songList: PropTypes.array.isRequired,
    likeSongList: PropTypes.array.isRequired,
    setCurrSong: PropTypes.func.isRequired,
    toggleSongStatus: PropTypes.func.isRequired,
    addSongList: PropTypes.func.isRequired,
    delSongList: PropTypes.func.isRequired,
    addLikeSongList: PropTypes.func.isRequired,
    delLikeSongList: PropTypes.func.isRequired,
    setPlaySongList: PropTypes.func.isRequired,
    addPlaySong: PropTypes.func.isRequired,

    listId: PropTypes.number.isRequired,
    isOwner: PropTypes.bool,
    like: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      ownerName: '',
      bgImgUrl: CDPlaceHolder,
      listImgUrl: CDPlaceHolder,
      createTime: '',
      tags: [],
      songList: [],
      subscribeLoading: false,
      likeLoading: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if ((prevProps.listId !== this.props.listId && this.props.listId) ||
      (this.props.like && this.props.likeSongList.length !== prevProps.likeSongList.length)) {
      this.getSongListDetail()
    }
  }

  componentDidMount () {
    if (this.props.listId) {
      this.getSongListDetail()
    }
  }

  getSongListDetail () {
    api.getPlayListDetail({
      id: this.props.listId
    }).then(result => {
      if (result.code === 200) {
        let time = moment(result.playlist.updateTime)
        this.setState({
          name: result.playlist.name,
          ownerName: result.playlist.creator.nickname,
          bgImgUrl: result.playlist.coverImgUrl ? `${result.playlist.coverImgUrl}?param=500y500` : CDPlaceHolder,
          listImgUrl: result.playlist.coverImgUrl ? `${result.playlist.coverImgUrl}?param=180y180` : CDPlaceHolder,
          createTime: time.isValid() ? time.format('YYYY-MM-DD HH:mm:ss') : '',
          tags: result.playlist.tags,
          songList: (result.playlist.tracks || []).map(item => {
            let time = Math.floor((item.dt || 0) / 1000)
            return {
              id: item.id,
              name: item.name,
              time,
              timeStr: secondToFormat(time),
              singer: item.ar.map(item => item.name).join(' / '),
              desc: item.al.name
            }
          })
        })
      }
    })
  }

  toggleSubscribe = () => {
    let subscribed = !!this.props.songList.find(item => item.id === this.props.listId)
    if (subscribed) {
      Modal.confirm({
        content: '确定取消收藏？',
        icon: null,
        centered: true,
        onOk: () => {
          return new Promise((resolve, reject) => {
            this.setState({
              subscribeLoading: true
            }, () => {
              api.playListSubscribe({
                t: 2,
                id: this.props.listId
              }).then(result => {
                if (result.code === 200) {
                  this.props.delSongList(this.props.listId)
                  message.info('取消收藏成功')
                  resolve()
                } else {
                  let err = ''
                  reject(err)
                }
                this.setState({
                  subscribeLoading: false
                })
              }).catch((e) => {
                this.setState({
                  subscribeLoading: false
                })
                message.error('取消收藏失败')
                console.log(e)
              })
            })
          })
        },
        onCancel: () => { }
      })
    } else {
      this.setState({
        subscribeLoading: true
      }, () => {
        api.playListSubscribe({
          t: 1,
          id: this.props.listId
        }).then(result => {
          if (result.code === 200) {
            this.props.addSongList({
              id: this.props.listId,
              isOwner: false,
              name: this.state.name,
              like: false
            })
            message.info('收藏成功')
          }
          this.setState({
            subscribeLoading: false
          })
        }).catch((e) => {
          this.setState({
            subscribeLoading: false
          })
          message.error('收藏失败')
          console.log(e)
        })
      })
    }
  }

  toggleLike = (songId) => {
    let like = !!this.props.likeSongList.find(id => id === songId)
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
                id: songId
              }).then(result => {
                if (result.code === 200) {
                  this.props.delLikeSongList(songId)
                  message.info('取消喜欢成功')
                  // if (result.playlistId === this.props.listId) {
                  //   this.getSongListDetail()
                  // }
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
          id: songId
        }).then(result => {
          if (result.code === 200) {
            this.props.addLikeSongList(songId)
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

  playAll = () => {
    this.props.setPlaySongList(this.state.songList)
    let songId = this.state.songList[0].id
    if (this.props.currSong === songId) {
      return
    }
    this.props.toggleSongStatus(true)
    this.props.setCurrSong(songId)
  }

  playSong = (songId) => {
    if (this.props.currSong === songId) {
      return
    }
    this.props.toggleSongStatus(true)
    this.props.addPlaySong(this.state.songList.find(item => item.id === songId))
    this.props.setCurrSong(songId)
  }

  render () {
    let subscribed = !!this.props.songList.find(item => item.id === this.props.listId)
    return (
      <div styleName='detail'>
        <img styleName='bg-img' src={this.state.bgImgUrl} alt='' />
        <div styleName='detail-head'>
          <div styleName='head-left' ><img src={this.state.listImgUrl} alt='' /></div>
          <div styleName='head-right'>
            <p styleName='title'>{this.state.name}</p>
            <div styleName='owner'>
              <label>{this.state.ownerName}</label><span styleName='time'>{this.state.createTime} 创建</span>
            </div>
            <p styleName='category'><label>标签：</label><span>{this.state.tags.join(' / ') || '暂无'}</span></p>
            <div styleName='btns'>
              <div styleName={classnames(['btn', { 'hidden': this.props.isOwner, 'disabled': this.state.subscribeLoading }])} onClick={this.toggleSubscribe}>
                <Icon styleName={classnames({ 'like': subscribed })} type={subscribed ? 'heart' : 'line-heart'} />
                <span>{subscribed ? '已' : ''}收藏</span>
              </div>
              <div styleName={classnames(['btn', { 'hidden': !this.state.songList.length }])} onClick={this.playAll}>
                <span >播放全部({this.state.songList.length})</span>
              </div>
            </div>
          </div>
        </div>
        <div styleName='result'>
          <ul >
            {this.state.songList.map(item => {
              let like = !!this.props.likeSongList.find(id => id === item.id)
              return (<li styleName={classnames({ 'current': this.props.currSong === item.id })} tabIndex='10000' key={item.id} onDoubleClick={() => this.playSong(item.id)}>
                <Icon styleName={classnames(['mark', { 'hidden': !(this.props.currSong === item.id) }])} type='play' />
                <Icon styleName={classnames(['heart', { 'like': like, 'disabled': this.state.likeLoading }])} type={like ? 'heart' : 'line-heart'} onClick={() => (this.toggleLike(item.id))} />
                <span styleName='title'>{item.name}</span>
                <Icon styleName='handle-btn' type='play' onClick={() => this.playSong(item.id)} />
                <span styleName='from'>{item.desc}</span>
                <span styleName='singer'>{item.singer}</span>
                <span styleName='time'>{item.timeStr}</span>
              </li>)
            })}
          </ul>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currSong: state.currSong,
    songList: state.songList,
    likeSongList: state.likeSongList
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
    addSongList: list => {
      dispatch(createAction(actionTypes.ADD_SONG_LIST, list))
    },
    delSongList: id => {
      dispatch(createAction(actionTypes.DEL_SONG_LIST, id))
    },
    addLikeSongList: id => {
      dispatch(createAction(actionTypes.ADD_LIKE_SONG, id))
    },
    delLikeSongList: id => {
      dispatch(createAction(actionTypes.DEL_LIKE_SONG, id))
    },
    setPlaySongList: list => {
      dispatch(createAction(actionTypes.SET_PLAY_SONG_LIST, list))
    },
    addPlaySong: song => {
      dispatch(createAction(actionTypes.ADD_PLAY_SONG, song))
    }
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  let params = {
    listId: 0,
    isOwner: false
  }
  if (ownProps.location.search) {
    let { id, isOwner, like } = qs.parse(ownProps.location.search.replace('?', ''))
    params = {
      listId: Number(id),
      isOwner: isOwner === 'true',
      like: like === 'true'
    }
  }
  return Object.assign({}, stateProps, dispatchProps, ownProps, params)
}

export default connect(mapStateToProps, mapDispatchToPorps, mergeProps)(SongListDetail)
