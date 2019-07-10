import React from 'react'
import * as PropTypes from 'prop-types'

class Icon extends React.Component {
  static defaultProps = {
    type: '',
    onClick: () => { }
  }

  static propTypes = {
    type: PropTypes.string.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func
  }

  handleClick = (e) => {
    this.props.onClick(e)
  }

  render () {
    let { type, className = '' } = this.props
    return (
      <i className={`app-icon app-icon-${type} ${className}`} onClick={this.handleClick} />
    )
  }
}

export default Icon
