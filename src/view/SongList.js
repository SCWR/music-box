import React from 'react'
import { connect } from 'react-redux'
import { Cascader, Spin } from 'antd'
import qs from 'qs'
import * as PropTypes from 'prop-types'
import './songList.module.scss'
import classnames from 'classnames'
import api from '@/api/data.js'
import CDPlaceHolder from '../assets/image/cd_placeholder.png'

const allCategory = '全部歌单'

class SongList extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    userId: PropTypes.number.isRequired,
    history: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      limit: 51,
      text: allCategory,
      selected: [allCategory],
      category: [{
        value: allCategory,
        label: allCategory
      }],
      total: 0,
      isLoading: false,
      playlist: []
    }
  }

  componentDidMount () {
    api.getCatList().then(result => {
      if (result.code === 200) {
        let category = [{
          value: result.all.name,
          label: result.all.name
        }, ...Object.entries(result.categories).map(([key, value]) => ({
          value: value,
          label: value,
          children: result.sub.filter(item => item.category === Number(key)).map(item => ({
            value: item.name,
            label: item.name
          }))
        }))]
        this.setState({
          category
        })
      }
    })
    this.getSongList()
  }

  getSongList = () => {
    let len = this.state.playlist.length
    if (this.state.total === len && len > 0) {
      return
    }
    this.setState({
      isLoading: true
    }, () => {
      api.getPlayList({
        limit: this.state.limit,
        cat: this.state.text === allCategory ? '' : this.state.text,
        offset: len
      }).then(result => {
        if (result.code === 200) {
          this.setState(prevState => {
            return {
              playlist: [...prevState.playlist, ...result.playlists],
              total: result.total
            }
          })
        }
        this.setState({
          isLoading: false
        })
      }).catch(e => {
        this.setState({
          isLoading: false
        })
      })
    })
  }

  onChange = (value, selectedOptions) => {
    let [selected] = selectedOptions.reverse()
    this.setState({
      selected: value,
      text: selected ? selected.label : allCategory,
      playlist: []
    }, () => {
      this.getSongList()
    })
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
      this.getSongList()
    }
  }

  gotoPage = (path, state) => {
    this.props.history.push(path)
  }

  render () {
    return (
      <div styleName='song-list'>
        <div styleName='category'>
          <Cascader options={this.state.category} value={this.state.selected} onChange={this.onChange} expandTrigger={'hover'}>
            <span styleName='category-selected'>{this.state.text}</span>
          </Cascader>
        </div>
        <div styleName='list' onScroll={this.handleScroll}>
          <div styleName={classnames(['box', { 'hidden': this.state.playlist.length === 0 }])} className='box'>
            {this.state.playlist.map(item => {
              let param = qs.stringify({ id: item.id, isOwner: item.userId === this.props.userId })
              return (<div styleName='playlist' key={item.id} onClick={() => this.gotoPage(`/songlist/detail?${param}`)}>
                <div styleName='imgbox' ><img src={item.coverImgUrl ? `${item.coverImgUrl}?param=180y180` : CDPlaceHolder} alt='' /></div>
                <p styleName='name' >{item.name}</p>
                <p styleName='owner' >by {item.creator && item.creator.nickname}</p>
              </div>)
            })}
          </div>
          <div styleName={classnames(['tips', { 'hidden': !(this.state.playlist.length === 0) }])}>
            <span styleName={classnames(['content', { 'hidden': this.state.isLoading }])} onClick={this.getSongList}>获取失败，点击再次尝试</span>
            <Spin styleName={classnames({ 'hidden': !this.state.isLoading })} size={'large'} />
          </div>
        </div>
      </div>
    )
  }
}

// 容器
const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

export default connect(mapStateToProps)(SongList)
