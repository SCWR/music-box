import React from 'react'
import { connect } from 'react-redux'
import './musicList.module.scss'
import Icon from '@/components/Icon.js'
import * as PropTypes from 'prop-types'
import { actionTypes, createAction } from '@/store/action.js'
import classnames from 'classnames'
import shallowequal from 'shallowequal'
class MusicList extends React.Component {
  static defaultProps = {
    check: false
  }

  static propTypes = {
    currSong: PropTypes.number.isRequired,
    playList: PropTypes.array.isRequired,
    setCurrSong: PropTypes.func.isRequired,
    toggleSongStatus: PropTypes.func.isRequired,
    setPlaySongList: PropTypes.func.isRequired,
    delPlaySong: PropTypes.func.isRequired,
    check: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      control: false
    }
    this.itemRef = React.createRef()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.check && prevProps.check !== this.props.check) {
      this.scrollIntoView()
    }
  }
  componentDidMount () {
    if (this.props.check) {
      this.scrollIntoView()
    }
  }

  clearList = () => {
    if (this.props.playList.length) {
      this.props.toggleSongStatus(false)
      this.props.setCurrSong(0)
      this.props.setPlaySongList([])
    }
  }

  delPlaySong = (songId) => {
    if (this.props.playList.length > 1) {
      if (this.props.currSong === songId) {
        let index = this.props.playList.findIndex(item => item.id === songId)
        let nextSong = (index === this.props.playList.length - 1) ? this.props.playList[0] : this.props.playList[index + 1]
        this.props.setCurrSong(nextSong.id)
      }
    } else {
      this.props.toggleSongStatus(false)
      this.props.setCurrSong(0)
    }
    this.props.delPlaySong(songId)
  }

  playSong = (songId) => {
    if (this.props.currSong === songId) {
      return
    }
    this.props.toggleSongStatus(true)
    this.props.setCurrSong(songId)
  }

  scrollIntoView () {
    setTimeout(() => {
      this.itemRef.current && this.itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }

  render () {
    return (
      <div styleName='list'>
        <div styleName='list-header' >
          <span styleName='title'>播放列表</span>
          <span styleName='btn' onClick={this.clearList}><Icon type='clear' />清空</span>
        </div>
        <div styleName='list-content'>
          <ul>
            {this.props.playList.map(item => {
              if (this.props.currSong === item.id) {
                return (<li styleName='current' ref={this.itemRef} tabIndex='10000' key={item.id} onDoubleClick={() => this.playSong(item.id)}>
                  <Icon styleName='mark' type='play' />
                  <span styleName='title'>{item.name}</span>
                  <Icon styleName='handle-btn' type='play' onClick={() => this.playSong(item.id)} />
                  <span styleName='singer' >{item.singer}</span>
                  <span styleName='time' >{item.timeStr}</span>
                  <Icon styleName='handle-btn' type='close' onClick={() => this.delPlaySong(item.id)} />
                </li>)
              }
              return (<li tabIndex='10000' key={item.id} onDoubleClick={() => this.playSong(item.id)}>
                <span styleName='title'>{item.name}</span>
                <Icon styleName='handle-btn' type='play' onClick={() => this.playSong(item.id)} />
                <span styleName='singer' >{item.singer}</span>
                <span styleName='time' >{item.timeStr}</span>
                <Icon styleName='handle-btn' type='close' onClick={() => this.delPlaySong(item.id)} />
              </li>)
            })}
          </ul>
          <div styleName={classnames(['tips', { 'hidden': this.props.playList.length }])}>暂无播放歌曲</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currSong: state.currSong,
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
    setPlaySongList: list => {
      dispatch(createAction(actionTypes.SET_PLAY_SONG_LIST, list))
    },
    delPlaySong: id => {
      dispatch(createAction(actionTypes.DEL_PLAY_SONG, id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToPorps)(MusicList)
