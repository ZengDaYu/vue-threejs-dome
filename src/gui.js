export function getModel() {
  let ui = {
    camera: {
      x: 9,
      y: 21,
      z: 20
    },
    autoRotate: false,
    target: {
      x: 0,
      y: 0,
      z: 0
    },
    ocean: {
      y: -200
    },
    sf03: {
      scale: 1,
      position: {
        x: 0,
        y: 10,
        z: 0
      },
      rotate: {
        x: 0,
        y: 0,
        z: 0
      },
      followMe: false
    },
    textures: {
      number: 1,
      visible: true
    },
    special: {
      color: 0xa79e1c,
      opacity: 0.8,
      showLine: false,
      showFog: false,
      suspend: false,
      playIt: false,
      limes: false,
      showEcharts: false,
      fly: false
    },
    sysKey: 0,
    replay: () => {
      ui.sysKey += 1
    }
  }
  return ui
}

export function setupPanel(gui, ui) {
  const angle = Math.PI / 2
  const angleUnit = Math.PI / 180

  const fb = gui.addFolder('相机环绕位置')
  fb.add(ui.target, 'x', -100, 100).step(0.1)
  fb.add(ui.target, 'y', -100, 100).step(0.1)
  fb.add(ui.target, 'z', -100, 100).step(0.1)
  fb.add(ui, 'autoRotate')
  // fb.open()

  const fo = gui.addFolder('海平面')
  fo.add(ui.ocean, 'y', -250, 10).step(0.01)
  // fo.open()

  const fx = gui.addFolder('箱子')
  fx.add(ui.textures, 'visible')
  fx.add(ui.textures, 'number', 0, 3).step(1)
  // fx.open()

  const fs = gui.addFolder('飞行器')
  fs.add(ui.sf03, 'scale', 0.1, 7).step(0.01)
  fs.add(ui.sf03, 'followMe')
  const position = fs.addFolder('位置')
  position.add(ui.sf03.position, 'x', -50, 50).step(1)
  position.add(ui.sf03.position, 'y', -50, 50).step(1)
  position.add(ui.sf03.position, 'z', -50, 50).step(1)
  // position.open()
  const rotate = fs.addFolder('旋转')
  rotate.add(ui.sf03.rotate, 'x', -angle, angle).step(angleUnit)
  rotate.add(ui.sf03.rotate, 'y', -angle, angle).step(angleUnit)
  rotate.add(ui.sf03.rotate, 'z', -angle, angle).step(angleUnit)
  // rotate.open()
  // fs.open()
  // let option = new Options()
  const fsp = gui.addFolder('物体特效')
  fsp.addColor(ui.special, 'color')
  fsp.add(ui.special, 'opacity', 0, 1).step(0.01)
  fsp.add(ui.special, 'showLine')
  fsp.add(ui.special, 'showFog')
  fsp.add(ui.special, 'suspend')
  fsp.add(ui.special, 'playIt')
  fsp.add(ui.special, 'limes')
  fsp.add(ui.special, 'showEcharts')
  fsp.add(ui.special, 'fly')
  fsp.open()
  // gui.add(ui, 'replay')
}
