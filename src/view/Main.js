import React from 'react'
import { connect } from 'react-redux'

import * as PropTypes from 'prop-types'
import classnames from 'classnames'
import shallowequal from 'shallowequal'
import memoize from 'memoize-one'
import qs from 'qs'

import { actionTypes, createAction } from '@/store/action.js'

import { Switch, Route, Redirect, withRouter } from 'react-router-dom'
import Icon from '@/components/Icon.js'

import Header from './Header.js'
import Footer from './Footer.js'
import Search from './Search.js'
import SongList from './SongList.js'
import SongListDetail from './SongListDetail.js'
import PlayDetail from './PlayDetail.js'

import api from '@/api/data.js'

import './main.module.scss'

class Main extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    // react-router
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    // recat-redux
    userId: PropTypes.number.isRequired,
    songList: PropTypes.array.isRequired,
    setSongList: PropTypes.func.isRequired,
    setLikeSongList: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    let { pathname, search } = this.props.location
    let active = `${pathname}${search}`
    this.state = {
      active: active === '/' ? '/songlist' : active
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.userId !== this.props.userId) {
      if (this.props.userId) {
        this.getSongList()
        this.getLikeSongList()
      } else {
        this.props.setSongList([])
        this.props.setLikeSongList([])
      }
    }
  }

  componentDidMount () {
    if (this.props.userId) {
      this.getSongList()
      this.getLikeSongList()
    } else {
      this.props.setSongList([])
      this.props.setLikeSongList([])
    }
  }

  owner = memoize((list) => list.filter(item => item.isOwner), (newArgs, oldArgs) => shallowequal(newArgs, oldArgs))
  otherOwenr = memoize((list) => list.filter(item => !item.isOwner), (newArgs, oldArgs) => shallowequal(newArgs, oldArgs))

  gotoPage = (path, state) => {
    this.setState({
      active: path
    })
    this.props.history.push(path)
  }

  getSongList () {
    api.getUserPlayList({
      uid: this.props.userId
    }).then(result => {
      if (result.code === 200) {
        let list = result.playlist.map((item, index) => {
          return {
            isOwner: item.userId === this.props.userId,
            name: index === 0 ? '我喜欢的音乐' : item.name,
            id: item.id,
            like: index === 0 && !item.subscribed
          }
        })
        this.props.setSongList(list)
      }
    })
  }

  getLikeSongList () {
    api.getLikeList({
      uid: this.props.userId
    }).then(result => {
      if (result.code === 200) {
        this.props.setLikeSongList(result.ids)
      }
    })
  }

  render () {
    let { active } = this.state
    let { songList } = this.props

    let owner = this.owner(songList).map(item => {
      let param = qs.stringify({ id: item.id, isOwner: item.isOwner, like: item.like })
      return (<div styleName={classnames(['menu-item', { 'menu-active': active === `/songlist/detail?${param}` }])} key={item.id} onClick={() => this.gotoPage(`/songlist/detail?${param}`)}>
        <Icon type={item.like ? 'line-heart' : 'song'} />
        <span>{item.name}</span>
      </div>)
    })
    let otherOwenr = this.otherOwenr(songList).map(item => {
      let param = qs.stringify({ id: item.id, isOwner: item.isOwner })
      return (<div styleName={classnames(['menu-item', { 'menu-active': active === `/songlist/detail?${param}` }])} key={item.id} onClick={() => this.gotoPage(`/songlist/detail?${param}`)}>
        <Icon type='song' />
        <span>{item.name}</span>
      </div>)
    })
    return (
      <div styleName='main-content'>
        <Header />
        <div styleName='content' >
          <div styleName='content-left'>
            <div styleName={classnames(['menu-item', { 'menu-active': active === '/search' }])} onClick={() => this.gotoPage('/search')}>
              <Icon type='search' />
              <span>搜索</span>
            </div>
            <div styleName={classnames(['menu-item', { 'menu-active': active === '/songlist' }])} onClick={() => this.gotoPage('/songlist')}>
              <Icon type='music' />
              <span>发现音乐</span>
            </div>
            <span styleName='menu-title' style={owner.length === 0 ? { 'display': 'none' } : {}}>创建的歌单</span>
            {owner}
            <span styleName='menu-title' style={otherOwenr.length === 0 ? { 'display': 'none' } : {}}>收藏的歌单</span>
            {otherOwenr}
          </div>
          <div styleName='content-right'>
            <Switch>
              <Route path='/songlist' exact component={SongList} />
              <Route path='/search' component={Search} />
              <Route path='/songlist/detail' component={SongListDetail} />
              <Redirect to='/songlist' />
            </Switch>
          </div>
          <PlayDetail />
        </div>
        <Footer />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    userId: state.userId,
    songList: state.songList
  }
}

const mapDispatchToPorps = dispatch => {
  return {
    setSongList: list => {
      dispatch(createAction(actionTypes.SET_SONG_LIST, list))
    },
    setLikeSongList: list => {
      dispatch(createAction(actionTypes.SET_LIKE_SONG_LIST, list))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToPorps)(Main))
