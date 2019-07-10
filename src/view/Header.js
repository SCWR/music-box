import React from 'react'
import { connect } from 'react-redux'
import { actionTypes, createAction } from '@/store/action.js'
import * as PropTypes from 'prop-types'
import Icon from '@/components/Icon.js'
import { Input, Modal, Button, message } from 'antd'
import shallowequal from 'shallowequal'
import classnames from 'classnames'
import accountImg from '@/assets/image/account.png'
import './header.module.scss'

import api from '@/api/data.js'

// electron remote对象
import { remote, ipcRenderer } from 'electron'

class Header extends React.Component {
  static defaultProps = {
  }

  static propTypes = {
    userId: PropTypes.number.isRequired,
    setUserId: PropTypes.func.isRequired
  }

  electronWindow = null

  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      loading: false,
      isLogin: false,
      phone: '',
      pwd: '',
      nickname: '',
      avatar: accountImg,
      // electron 环境
      isElectron: false,
      isMaximize: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {}

  componentDidMount () {
    if (this.props.userId) {
      api.getUserDetail({
        uid: this.props.userId
      }).then((result) => {
        if (result.code === 200) {
          this.setState({
            isLogin: true,
            nickname: result.profile.nickname,
            avatar: result.profile.avatarUrl ? `${result.profile.avatarUrl}?param=24y24` : accountImg
          })
        }
      }).catch(e => {
        console.log(e)
      })
    }
    this.electronWindow = remote.getCurrentWindow()
    if (this.electronWindow) {
      this.setState({
        isElectron: true
      })
    }
    ipcRenderer.on('isMaximize', (event, arg) => {
      this.setState({
        isMaximize: arg
      })
    })
  }
  componentWillUnmount () {
    this.electronWindow = null
    ipcRenderer.removeAllListeners('isMaximize')
  }

  windowMinimize = () => {
    this.electronWindow && this.electronWindow.minimize()
  }
  windowMaximize = () => {
    if (this.state.isMaximize) {
      this.electronWindow && this.electronWindow.unmaximize()
    } else {
      this.electronWindow && this.electronWindow.maximize()
    }
  }

  windowClose = () => {
    this.electronWindow && this.electronWindow.close()
  }

  formChange = (key, value) => {
    this.setState({
      [key]: value
    })
  }

  handleLogin = () => {
    if (this.state.isLogin) {
      Modal.confirm({
        content: '确定退出音乐盒子？',
        icon: null,
        centered: true,
        onOk: () => {
          return api.logout().then(result => {
            if (result.code === 200) {
              this.setState({
                isLogin: false,
                nickname: '',
                avatar: accountImg
              })
              this.props.setUserId(0)
            }
          }).catch((e) => {
            console.log(e)
            message.error('退出失败')
          })
        },
        onCancel: () => {}
      })
    } else {
      this.setState({
        visible: true
      })
    }
  }

  handleOk = e => {
    this.setState({
      loading: true
    })
    api.loginCellphone({
      phone: this.state.phone,
      password: this.state.pwd,
      countrycode: '86'
    }).then((result) => {
      if (result.code === 200) {
        this.props.setUserId(result.account.id)
        this.setState({
          isLogin: true,
          visible: false,
          phone: '',
          pwd: '',
          nickname: result.profile.nickname,
          avatar: result.profile.avatarUrl ? `${result.profile.avatarUrl}?param=24y24` : accountImg
        })
      }
      this.setState({
        loading: false
      })
    }).catch(e => {
      console.log(e)
      message.error('账户或密码错误')
      this.setState({
        loading: false
      })
    })
  }

  handleCancel = e => {
    console.log(e)
    this.setState({
      phone: '',
      pwd: '',
      visible: false
    })
  }

  render () {
    return (
      <div styleName='content'>
        <Icon styleName='logo' type='logo' />
        <span styleName='title'>音乐盒子</span>
        <span styleName='account' onClick={this.handleLogin}>
          <img styleName='icon' type='account' src={this.state.avatar} alt='头像' />
          <em>-</em>
          <label>{this.state.nickname || '未登录'}</label>
        </span>
        <div styleName={classnames('btns', { 'hidden': !this.state.isElectron })}>
          <Icon type='view-out' onClick={this.windowMinimize} />
          <Icon type={this.state.isMaximize ? 'reduction' : 'view-in'} onClick={this.windowMaximize} />
          <Icon type='close' onClick={this.windowClose} />
        </div>
        <Modal title='登录' width={400} visible={this.state.visible} centered footer={null} onOk={this.handleOk} onCancel={this.handleCancel}>
          <div styleName='login' >
            <Input styleName='account' prefix={<Icon type='account' />} value={this.state.phone} onChange={(e) => this.formChange('phone', e.target.value)} placeholder='手机号码' />
            <Input.Password styleName='password' prefix={<Icon type='password' />} value={this.state.pwd} onChange={(e) => this.formChange('pwd', e.target.value)} placeholder='密码'></Input.Password>
            <Button styleName='login-btn' key='submit' type='primary' loading={this.state.loading} onClick={this.handleOk}>
              登录
            </Button>
          </div>
        </Modal>
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

const mapDispatchToPorps = dispatch => {
  return {
    setUserId: id => {
      dispatch(createAction(actionTypes.SET_USER, id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToPorps)(Header)
