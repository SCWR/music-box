import React from 'react'
import { connect } from 'react-redux'
import { Input, Spin, message, Modal } from 'antd'
import { actionTypes, createAction } from '@/store/action.js'
import Icon from '@/components/Icon.js'
import shallowequal from 'shallowequal'
import classnames from 'classnames'
import * as PropTypes from 'prop-types'
import './search.module.scss'
import api from '@/api/data.js'
import { secondToFormat } from '@/assets/js/toolUtil.js'

class Search extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    currSong: PropTypes.number.isRequired,
    likeSongList: PropTypes.array.isRequired,
    suggestList: PropTypes.array.isRequired,
    setCurrSong: PropTypes.func.isRequired,
    toggleSongStatus: PropTypes.func.isRequired,
    addLikeSongList: PropTypes.func.isRequired,
    delLikeSongList: PropTypes.func.isRequired,
    addPlaySong: PropTypes.func.isRequired,
    setSuggestList: PropTypes.func.isRequired,
    addSuggest: PropTypes.func.isRequired,
    delSuggest: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      isSearch: false,
      isLoading: false,
      searchResult: [],
      suggestHot: [],
      keyword: '',
      total: 0
    }
  }

  shouldComponentUpdate (prevProps, nextProps, prevState, nextState) {
    return !shallowequal(prevProps, nextProps) || !shallowequal(prevState, nextState)
  }

  componentDidMount () {
    this.suggest()
  }

  suggest () {
    api.searchHot({}).then(result => {
      if (result.code === 200) {
        this.setState({
          suggestHot: result.result.hots.map(item => item.first)
        })
      }
    })
  }

  search = (isEmpty, isSuggest) => {
    let len = this.state.searchResult.length
    if ((this.state.total === len && len > 0) || this.state.isLoading) {
      return
    }
    isSuggest && this.props.addSuggest(this.state.keyword)
    this.setState({
      isLoading: true
    }, () => {
      api.search({
        keywords: this.state.keyword,
        limit: 30,
        offset: len,
        type: 1
      }).then(result => {
        if (result.code === 200) {
          this.setState((prevProps) => {
            let list = result.result.songs.map(item => {
              let time = Math.floor((item.duration || 0) / 1000)
              return {
                id: item.id,
                name: item.name,
                time,
                timeStr: secondToFormat(time),
                singer: item.artists.map(item => item.name).join(' / '),
                desc: item.album.name
              }
            })
            return {
              isLoading: false,
              total: result.result.songCount,
              searchResult: isEmpty ? list : [...prevProps.searchResult, ...list]
            }
          })
        } else {
          this.setState({
            isLoading: false
          })
        }
      }).catch(e => {
        console.log(e)
        this.setState({
          isLoading: false
        })
      })
    })
  }

  beginSearch (value) {
    if (value) {
      this.setState({
        keyword: value,
        isSearch: true,
        isLoading: false,
        total: 0,
        searchResult: []
      }, () => this.search(true, true))
    }
  }

  handleChange = (e) => {
    let value = e.target.value
    if (this.state.isSearch) {
      if (value) {
        this.setState({
          keyword: value,
          isLoading: false,
          total: 0,
          searchResult: []
        }, () => this.search(true, false))
      } else {
        this.setState({
          keyword: value,
          isLoading: false,
          isSearch: false,
          total: 0,
          searchResult: []
        })
      }
    } else {
      this.setState({
        keyword: value
      })
    }
  }

  handleScroll = (e) => {
    if (this.state.isLoading) {
      return
    }
    let box = e.currentTarget
    let content = box.querySelector('.box')
    let boxRect = box.getBoundingClientRect()
    let contentRect = content.getBoundingClientRect()
    if (contentRect.height - box.scrollTop - boxRect.height < 50) {
      this.search()
    }
  }

  playSong = (songId) => {
    if (this.props.currSong === songId) {
      return
    }
    this.props.toggleSongStatus(true)
    this.props.addPlaySong(this.state.searchResult.find(item => item.id === songId))
    this.props.setCurrSong(songId)
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

  clearSuggest = () => {
    this.props.setSuggestList([])
  }

  delSuggest = (item) => {
    this.props.delSuggest(item)
  }

  render () {
    let { searchResult, isSearch, isLoading } = this.state
    return (
      <div styleName='search'>
        <Input.Search styleName='keyword' placeholder='搜索歌曲' size={'large'} allowClear value={this.state.keyword} onChange={this.handleChange} onSearch={(value) => this.beginSearch(value)}></Input.Search>
        <div styleName={classnames(['suggest', { 'hidden': isSearch }])}>
          <div styleName='suggest-left'>
            <p styleName='suggest-title'>热门搜索</p>
            <div styleName='suggest-list' >
              {this.state.suggestHot.map(item => (<span styleName='suggest-item' key={item} onClick={() => this.beginSearch(item)}>{item}</span>))}
            </div>
          </div>
          <div styleName='suggest-right'>
            <p styleName='suggest-title'><span>搜索历史</span><Icon styleName='clear' type='clear' onClick={this.clearSuggest} /></p>
            <div styleName='suggest-list'>
              {this.props.suggestList.map(item => (<p styleName='suggest-item' key={item}><span onClick={() => this.beginSearch(item)}>{item}</span><Icon type='close' onClick={() => this.delSuggest(item)} /></p>))}
            </div>
          </div>
        </div>
        <div styleName={classnames(['result', { 'hidden': !isSearch }])} onScroll={this.handleScroll}>
          <ul styleName={classnames({ 'hidden': searchResult.length === 0 })} className='box'>
            {searchResult.map(item => {
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
          <div styleName={classnames(['tips', { 'hidden': !(searchResult.length === 0) }])}>
            <span styleName={classnames(['content', { 'hidden': isLoading }])}>暂无搜索结果</span>
            <Spin styleName={classnames({ 'hidden': !isLoading })} size={'large'} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currSong: state.currSong,
    likeSongList: state.likeSongList,
    suggestList: state.suggestList
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
    addLikeSongList: id => {
      dispatch(createAction(actionTypes.ADD_LIKE_SONG, id))
    },
    delLikeSongList: id => {
      dispatch(createAction(actionTypes.DEL_LIKE_SONG, id))
    },
    addPlaySong: song => {
      dispatch(createAction(actionTypes.ADD_PLAY_SONG, song))
    },
    setSuggestList: list => {
      dispatch(createAction(actionTypes.SET_SUGGEST_LIST, list))
    },
    addSuggest: keyword => {
      dispatch(createAction(actionTypes.ADD_SUGGEST, keyword))
    },
    delSuggest: keyword => {
      dispatch(createAction(actionTypes.DEL_SUGGEST, keyword))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToPorps)(Search)
