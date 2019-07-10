class MousePos {
  movex
  movey
  posEvent = (e) => {
    var oEvent = e.originalEvent || e
    if (oEvent.clientX || oEvent.clientY) {
      this.movex = oEvent.clientX
      this.movey = oEvent.clientY
    }
  }

  start () {
    document.addEventListener('mousemove', this.posEvent)
  }
  stop () {
    document.removeEventListener('mousemove', this.posEvent)
  }
  isMouseOut (elem, x = this.movex, y = this.movey) {
    x = x || 0
    y = y || 0
    let rect = elem.getBoundingClientRect()
    return (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom)
  }
  isMouseCloseLeft (elem, x = this.movex) {
    let rect = elem.getBoundingClientRect()
    x = x || 0
    let dif = x - rect.left
    return dif <= rect.width / 2
  }
  isMouseCloseTop (elem, y = this.movey) {
    let rect = elem.getBoundingClientRect()
    y = y || 0
    let dif = y - rect.top
    return dif <= rect.height / 2
  }
}

export default MousePos
