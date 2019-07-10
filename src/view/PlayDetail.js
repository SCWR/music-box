import React from 'react'
import { connect } from 'react-redux'
import api from '@/api/data.js'
import { actionTypes, createAction } from '@/store/action.js'
import classnames from 'classnames'
import * as PropTypes from 'prop-types'
import MousePos from '@/assets/js/MousePos.js'
import { Modal, message } from 'antd'
import Icon from '@/components/Icon.js'
import { formatToSecond, binerySearch } from '@/assets/js/toolUtil.js'
import CDPlaceHolder from '../assets/image/cd_placeholder.png'

import './playDetail.module.scss'

const DESC = {
  nolyric: '纯音乐，无歌词',
  uncollected: '未收录歌词'
}

class PlayDetail extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    currSong: PropTypes.number.isRequired,
    playTime: PropTypes.number.isRequired,
    songStatus: PropTypes.bool.isRequired,
    songDetail: PropTypes.bool.isRequired,
    likeSongList: PropTypes.array.isRequired,
    toggleSongDetail: PropTypes.func.isRequired,
    addLikeSongList: PropTypes.func.isRequired,
    delLikeSongList: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      singer: '',
      album: '',
      likeLoading: false,
      bgImgUrl: CDPlaceHolder,
      songImgUrl: CDPlaceHolder,
      lyric: [],
      lyricTime: [],
      tips: '',
      contorl: false
    }
    this.contentRef = React.createRef()
    this.wordsRef = React.createRef()
    this.mousePos = new MousePos()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.currSong !== prevProps.currSong) { // && this.props.songDetail
      this.checkStatus()
    }
    if (this.props.songDetail) {
      this.scrollIntoView()
    }
  }

  componentDidMount () {
    this.mousePos.start()
    this.checkStatus()
  }

  componentWillUnmount () {
    this.mousePos.stop()
  }

  checkStatus () {
    if (this.props.currSong) {
      this.getSongDetail()
      this.getSongLyric()
    } else {
      this.shrinkView()
      this.setState({
        name: '',
        singer: '',
        album: '',
        likeLoading: false,
        bgImgUrl: CDPlaceHolder,
        songImgUrl: CDPlaceHolder,
        lyric: [],
        tips: ''
      })
    }
  }

  scrollIntoView () {
    if (this.props.songDetail && this.wordsRef.current &&
      this.contentRef.current && this.mousePos.isMouseOut(this.contentRef.current)) {
      this.wordsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  shrinkView = () => {
    this.props.toggleSongDetail(false)
  }

  getSongLyric () {
    this.setState({
      tips: ''
    }, () => {
      api.getSongLyric({
        id: this.props.currSong
      }).then(result => {
        if (result.code) {
          if (result.nolyric) {
            this.setState({
              lyric: [],
              tips: DESC.nolyric
            })
          } else if (result.uncollected) {
            this.setState({
              lyric: [],
              tips: DESC.uncollected
            })
          } else {
            let reg = /\[(.*)\]/
            let lyricTime = []
            let lyric = result.lrc && (result.lrc.lyric || '').split('\n').map(item => {
              let time = -1
              let match = ''
              if (reg.test(item)) {
                let exec = reg.exec(item)
                match = exec[0]
                time = formatToSecond(exec[1])
              }
              lyricTime.push(time)
              let words = item.replace(match, '').trim()
              return { time, words }
            }).filter(({ time, words }) => (time > -1 || (time === -1 && words)))
            this.setState({
              lyric,
              lyricTime
            }, () => {
              this.contentRef.current.scrollTop = 0
            })
          }
        }
      }).catch(e => {})
    })
  }

  getSongDetail () {
    api.getSongDetail({
      ids: String(this.props.currSong)
    }).then(result => {
      if (result.code === 200) {
        let { songs: [song = {}] } = result
        this.setState({
          name: song.name,
          singer: (song.ar || []).map(item => item.name).join(' / '),
          album: song.al && song.al.name,
          bgImgUrl: song.al && song.al.picUrl ? `${song.al.picUrl}?param=500y500` : CDPlaceHolder,
          songImgUrl: song.al && song.al.picUrl ? `${song.al.picUrl}?param=180y180` : CDPlaceHolder
        })
      }
    }).catch(e => {})
  }

  toggleLike = () => {
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

  render () {
    let like = !!this.props.likeSongList.find(id => id === this.props.currSong)
    let highlight = this.state.lyricTime.length === 0 ? -1 : binerySearch(this.props.playTime, this.state.lyricTime)
    return (
      <div styleName={classnames('detail', { 'small': !this.props.songDetail })}>
        <img styleName='bg-img' src={this.state.bgImgUrl} alt='' />
        <div styleName='zoom-out' onClick={this.shrinkView}>
          <Icon styleName='btn' type='shrink' />
        </div>
        <div styleName='content' >
          <div styleName='content-left'>
            <div styleName='disc-box' >
              <div styleName={classnames('disc', { 'stop': !this.props.songStatus })}>
                <img src={this.state.songImgUrl} alt='' />
              </div>
            </div>
            <div styleName='btns' >
              <div styleName='btn'>
                <Icon styleName={classnames(['heart', { 'like': like, 'disabled': this.state.likeLoading }])} type={like ? 'heart' : 'line-heart'} onClick={this.toggleLike} />
                <span>喜欢</span>
              </div>
            </div>
          </div>
          <div styleName='content-right'>
            <div styleName='song-detail'>
              <span styleName='title' >{this.state.name}</span>
              <div>
                <p><label>专辑：</label><span>{this.state.album}</span></p>
                <p><label>歌手：</label><span>{this.state.singer}</span></p>
              </div>
            </div>
            <div styleName='lyric' ref={this.contentRef}>
              {this.state.lyric.map((item, index) => {
                let isHighlight = item.time === highlight
                if (isHighlight) {
                  return (<p styleName={classnames(['words', { 'highlight': isHighlight }])} ref={this.wordsRef} key={index} target-id={item.time}>{item.words}</p>)
                } else {
                  return (<p styleName={classnames(['words', { 'highlight': isHighlight }])} key={index} target-id={item.time}>{item.words}</p>)
                }
              })}
              <div styleName={classnames(['tips', { 'hidden': !this.state.tips }])}>{this.state.tips}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currSong: state.currSong,
    songStatus: state.songStatus,
    songDetail: state.songDetail,
    playTime: state.playTime,
    likeSongList: state.likeSongList
  }
}

const mapDispatchToPorps = dispatch => {
  return {
    toggleSongDetail: toggle => {
      dispatch(createAction(actionTypes.TOGGLE_SONG_DETAIL, toggle))
    },
    addLikeSongList: id => {
      dispatch(createAction(actionTypes.ADD_LIKE_SONG, id))
    },
    delLikeSongList: id => {
      dispatch(createAction(actionTypes.DEL_LIKE_SONG, id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToPorps)(PlayDetail)
