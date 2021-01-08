// new
import * as THREE from 'three'
//    动态观察-鼠标左键/触摸：一个手指移动
//    ？缩放-鼠标中键或鼠标滚轮/触摸：两个手指展开或挤压
//    ？平移-鼠标右键或箭头键/触摸：三个查找器滑动

export default function OrbitControls (object, domElement, global) {
  this.object = object
  this.domElement = (domElement !== undefined) ? domElement : document

  // 该控件开启或禁用
  this.enabled = true

  // “target”设置焦点的位置，即物体环绕的位置
  this.target = new THREE.Vector3()

  // 可以推拉多远（仅透视摄影机）
  this.minDistance = 0
  this.maxDistance = Infinity

  // 放大和缩小的距离（仅限于正交摄影机）( OrthographicCamera only )
  this.minZoom = 0
  this.maxZoom = Infinity

  //可以垂直环绕多远，上限和下限。
  //范围是0到数学.PI弧度。
  this.minPolarAngle = 0 // radians
  this.maxPolarAngle = Math.PI // radians

  //水平轨道的距离，上限和下限。
  //如果设置，则必须是间隔[-数学.PI, 数学.PI]
  this.minAzimuthAngle = - Infinity // radians
  this.maxAzimuthAngle = Infinity // radians

  //设置为真以启用阻尼（惯性）
  //如果启用阻尼，则必须调用控件更新（）在动画循环中
  this.enableDamping = false
  this.dampingFactor = 0.05

  // 相机推拉，体现为能否缩放
  this.enableZoom = true
  this.zoomSpeed = 1.0

  // 能否用鼠标拖动旋转
  this.enableRotate = true
  this.rotateSpeed = 1.0

  this.enablePan = true
  this.panSpeed = 1.0
  // 设置为false可禁用平移
  this.screenSpacePanning = false
  this.keyPanSpeed = 7.0	// pixels moved per arrow key push

  //设置为true可自动围绕目标旋转
  //如果启用了自动旋转，则必须调用控件更新（）在动画循环中
  this.autoRotate = false
  this.autoRotateSpeed = 2.0 // 30 seconds per round when fps is 60

  // 设置为false以禁用键盘的使用
  this.enableKeys = true

  // 键盘上能用的键
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }

  // 鼠标键
  this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }

  // 初始值，用于重置
  this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

  // for reset
  this.target0 = this.target.clone()
  this.position0 = this.object.position.clone()
  this.zoom0 = this.object.zoom

  // 鼠标右键按下时的位置，为了给元素添加选中事件
  const rightPointEven = { clientX: 0, clientY: 0 }
  // 鼠标左键按下时的位置，为了给元素添加点击事件
  const leftPointEven = { clientX: 0, clientY: 0 }
  // 暂存射线相交的物体（交互的模型对象）
  let intersected = null
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2(1, 1)
  let moveEvent = null

  //
  // public methods
  //

  this.getPolarAngle = function () {
    return spherical.phi
  }

  this.getAzimuthalAngle = function () {
    return spherical.theta
  }

  // 保存当前状态
  this.saveState = function () {
    scope.target0.copy(scope.target)
    scope.position0.copy(scope.object.position)
    scope.zoom0 = scope.object.zoom
  }

  // 重置
  this.reset = function () {
    scope.target.copy(scope.target0)
    scope.object.position.copy(scope.position0)
    scope.object.zoom = scope.zoom0

    scope.object.updateProjectionMatrix()
    scope.dispatchEvent(changeEvent)

    scope.update()

    state = STATE.NONE

  }

  this.update = function () {
    let offset = new THREE.Vector3()
    let quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0))
    let quatInverse = quat.clone().invert()
    let lastPosition = new THREE.Vector3()
    let lastQuaternion = new THREE.Quaternion()
    let twoPI = 2 * Math.PI

    return function update() {
      let {position} = scope.object
      offset.copy(position).sub(scope.target)
      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat)
      // angle from z-axis around y-axis
      spherical.setFromVector3(offset)
      if(scope.autoRotate && state === STATE.NONE) {
        rotateLeft(getAutoRotationAngle())
      }

      if(scope.enableDamping) {
        spherical.theta += sphericalDelta.theta * scope.dampingFactor
        spherical.phi += sphericalDelta.phi * scope.dampingFactor
      } else {
        spherical.theta += sphericalDelta.theta
        spherical.phi += sphericalDelta.phi
      }

      // restrict theta to be between desired limits

      let min = scope.minAzimuthAngle
      let max = scope.maxAzimuthAngle

      if(isFinite(min) && isFinite(max)) {
        if(min < - Math.PI) min += twoPI; else if(min > Math.PI) min -= twoPI
        if(max < - Math.PI) max += twoPI; else if(max > Math.PI) max -= twoPI
        if(min <= max) {
          spherical.theta = Math.max(min, Math.min(max, spherical.theta))
        } else {
          spherical.theta = (spherical.theta > (min + max) / 2) ?
            Math.max(min, spherical.theta) :
            Math.min(max, spherical.theta)
        }
      }

      // restrict phi to be between desired limits
      spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi))

      spherical.makeSafe()


      spherical.radius *= scale

      // restrict radius to be between desired limits
      spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius))

      // move target to panned location

      if(scope.enableDamping === true) {

        scope.target.addScaledVector(panOffset, scope.dampingFactor)

      } else {
        // 将目标移动到平移位置
        scope.target.add(panOffset)

      }

      offset.setFromSpherical(spherical)

      // 设置相机位置为上方
      offset.applyQuaternion(quatInverse)

      position.copy(scope.target).add(offset)

      scope.object.lookAt(scope.target)

      if(scope.enableDamping === true) {

        sphericalDelta.theta *= (1 - scope.dampingFactor)
        sphericalDelta.phi *= (1 - scope.dampingFactor)

        panOffset.multiplyScalar(1 - scope.dampingFactor)

      } else {

        sphericalDelta.set(0, 0, 0)

        panOffset.set(0, 0, 0)

      }

      scale = 1

      //更新条件为：
      //最小值（摄影机置换，摄影机以弧度为单位旋转）^2>EPS
      //使用小角度近似cos（x/2）=1-x^2/8
      if(zoomChanged ||
				lastPosition.distanceToSquared(scope.object.position) > EPS ||
				8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
        scope.dispatchEvent(changeEvent)
        lastPosition.copy(scope.object.position)
        lastQuaternion.copy(scope.object.quaternion)
        zoomChanged = false
        return true
      }
      return false
    }
  }()

  this.dispose = function () {
    scope.domElement.removeEventListener('contextmenu', onContextMenu, false)

    scope.domElement.removeEventListener('pointerdown', onPointerDown, false)
    scope.domElement.removeEventListener('mousewheel', onMouseWheel, false)
    scope.domElement.removeEventListener('mousemove', onMousemove, false)

    scope.domElement.removeEventListener('touchstart', onTouchStart, false)
    scope.domElement.removeEventListener('touchend', onTouchEnd, false)
    scope.domElement.removeEventListener('touchmove', onTouchMove, false)

    scope.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, false)
    scope.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp, false)

    window.removeEventListener('keydown', onKeyDown, false)

    //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

  }

  //
  // internals
  //

  // eslint-disable-next-line consistent-this
  let scope = this

  let changeEvent = { type: 'change' }
  let startEvent = { type: 'start' }
  let endEvent = { type: 'end' }

  const STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  }

  let state = STATE.NONE

  const EPS = 0.000001

  // 球坐标中的当前位置
  let spherical = new THREE.Spherical()
  let sphericalDelta = new THREE.Spherical()

  let scale = 1
  let panOffset = new THREE.Vector3()
  let zoomChanged = false

  let rotateStart = new THREE.Vector2()
  let rotateEnd = new THREE.Vector2()
  let rotateDelta = new THREE.Vector2()

  let panStart = new THREE.Vector2()
  let panEnd = new THREE.Vector2()
  let panDelta = new THREE.Vector2()

  let dollyStart = new THREE.Vector2()
  let dollyEnd = new THREE.Vector2()
  let dollyDelta = new THREE.Vector2()

  function getAutoRotationAngle() {

    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed

  }

  function getZoomScale() {

    return Math.pow(0.95, scope.zoomSpeed)

  }

  function rotateLeft(angle) {

    sphericalDelta.theta -= angle

  }

  function rotateUp(angle) {

    sphericalDelta.phi -= angle

  }

  let panLeft = function () {

    let v = new THREE.Vector3()

    return function panLeft(distance, objectMatrix) {

      v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
      v.multiplyScalar(- distance)

      panOffset.add(v)

    }

  }()

  let panUp = function () {

    let v = new THREE.Vector3()

    return function panUp(distance, objectMatrix) {

      if(scope.screenSpacePanning === true) {

        v.setFromMatrixColumn(objectMatrix, 1)

      } else {

        v.setFromMatrixColumn(objectMatrix, 0)
        v.crossVectors(scope.object.up, v)

      }

      v.multiplyScalar(distance)

      panOffset.add(v)

    }

  }()

  // deltaX和deltaY以像素为单位；right和down为正负
  let pan = function () {

    let offset = new THREE.Vector3()

    return function pan(deltaX, deltaY) {
      let element = scope.domElement

      if(scope.object.isPerspectiveCamera) {
        // perspective
        let {position} = scope.object
        offset.copy(position).sub(scope.target)
        let targetDistance = offset.length()
        // 视场的一半在屏幕的中心到顶部
        targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0)

        // 实际上不使用屏幕宽度，因为透视相机是固定在屏幕上的
        panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix)
        panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix)

      } else if(scope.object.isOrthographicCamera) {
        // orthographic,直角？
        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix)
        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix)

      } else {
        // 相机既不是正交也不是透视，相机只有这两种类型
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.')
        scope.enablePan = false
      }
    }
  }()

  function dollyOut(dollyScale) {

    if(scope.object.isPerspectiveCamera) {

      scale /= dollyScale

    } else if(scope.object.isOrthographicCamera) {

      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale))
      scope.object.updateProjectionMatrix()
      zoomChanged = true

    } else {

      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      scope.enableZoom = false

    }

  }

  function dollyIn(dollyScale) {
    if(scope.object.isPerspectiveCamera) {

      scale *= dollyScale

    } else if(scope.object.isOrthographicCamera) {

      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale))
      scope.object.updateProjectionMatrix()
      zoomChanged = true

    } else {

      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      scope.enableZoom = false

    }

  }

  // 旋转相机，起始点
  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY)
  }

  // 相机缩放，起始点
  function handleMouseDownDolly(event) {
    dollyStart.set(event.clientX, event.clientY)

  }
  // 改变相机焦点
  function handleMouseDownPan(event) {

    panStart.set(event.clientX, event.clientY)

  }

  // 鼠标按下移动时的回调
  function handleMouseMoveRotate(event) {
    rotateEnd.set(event.clientX, event.clientY)
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed)
    let element = scope.domElement
    // 在整个屏幕上旋转360度
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight) // yes, height
    // 沿整个屏幕上下旋转尝试360度，但限制在180度
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight)
    rotateStart.copy(rotateEnd)
    scope.update()
  }

  // 相机缩放时的回调
  function handleMouseMoveDolly(event) {
    dollyEnd.set(event.clientX, event.clientY)
    dollyDelta.subVectors(dollyEnd, dollyStart)
    if(dollyDelta.y > 0) {
      dollyOut(getZoomScale())
    } else if(dollyDelta.y < 0) {
      dollyIn(getZoomScale())
    }
    dollyStart.copy(dollyEnd)
    scope.update()
  }

  // 鼠标右键按下后移动的回调
  function handleMouseMovePan(event) {
    panEnd.set(event.clientX, event.clientY)
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)
    pan(-panDelta.x, -panDelta.y)
    panStart.copy(panEnd)
    scope.update()
  }

  function getIntersects(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, scope.object.children[0].children[0])
    // 计算物体和射线的焦点
    return raycaster.intersectObject(global.scene, true)
  }

  function handleRightMouseUp(event) {
    if(rightPointEven.clientX === event.clientX && rightPointEven.clientY === event.clientY) {
      const intersects = getIntersects(event)
      if(intersects.length > 0) {
        if(intersects[0].object.parent.name === 'floor') {
          return
        }
        if(intersected !== intersects[0].object) {
          if(intersected && intersected.material.emissive) intersected.material.emissive.setHex(intersected.currentHex)
          // 记录当前对象
          intersected = intersects[0].object
          if(intersected.material.emissive) {
            // 记录当前对象本身颜色
            intersected.currentHex = intersected.material.emissive.getHex()
            // 设置颜色为灰色
            intersected.material.emissive.setHex(0x333333)
          }
        } else {
        // 恢复上一个对象颜色并置空变量
          if(intersected && intersected.material.emissive) intersected.material.emissive.setHex(intersected.currentHex)
          intersected = null
        }
      }
    }
    rightPointEven.clientX = 0
    rightPointEven.clientY = 0
  }

  function handleLeftMouseUp(event) {
    if(leftPointEven.clientX === event.clientX && leftPointEven.clientY === event.clientY) {
      const intersects = getIntersects(event)
      if(intersects.length > 0) {
        intersects[0].object.material.color.set(new THREE.Color().setHex(Math.random() * 0xffffff))
      }
      leftPointEven.clientX = 0
      leftPointEven.clientY = 0
    }
  }

  // 鼠标抬起事件
  function handleMouseUp(event) {
    if(scope.enablePan) {
      if(event.button === scope.mouseButtons.RIGHT) {
        handleRightMouseUp(event)
      } else if(event.button === scope.mouseButtons.LEFT) {
        handleLeftMouseUp(event)
      }
    }
  }

  // 适配浏览器滚动条
  function handleMouseWheel(event) {
    if(event.deltaY < 0) {
      dollyIn(getZoomScale())
    } else if(event.deltaY > 0) {
      dollyOut(getZoomScale())
    }
    scope.update()
  }

  // 键盘按键响应
  function handleKeyDown(event) {
    let needsUpdate = false
    switch (event.keyCode) {
    case scope.keys.UP:
      pan(0, - scope.keyPanSpeed)
      needsUpdate = true
      break

    case scope.keys.BOTTOM:
      pan(0, scope.keyPanSpeed)
      needsUpdate = true
      break

    case scope.keys.LEFT:
      pan(- scope.keyPanSpeed, 0)
      needsUpdate = true
      break

    case scope.keys.RIGHT:
      pan(scope.keyPanSpeed, 0)
      needsUpdate = true
      break

    default:
      break
    }

    if(needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault()
      scope.update()
    }
  }

  function handleTouchStartRotate(event) {
    if(event.touches.length === 1) {
      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)
      rotateStart.set(x, y)
    }
  }

  function handleTouchStartPan(event) {
    if(event.touches.length === 1) {
      panStart.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)
      panStart.set(x, y)
    }
  }

  function handleTouchStartDolly(event) {
    let dx = event.touches[0].pageX - event.touches[1].pageX
    let dy = event.touches[0].pageY - event.touches[1].pageY
    let distance = Math.sqrt(dx * dx + dy * dy)
    dollyStart.set(0, distance)
  }

  function handleTouchStartDollyPan(event) {
    if(scope.enableZoom) handleTouchStartDolly(event)
    if(scope.enablePan) handleTouchStartPan(event)
  }

  function handleTouchStartDollyRotate(event) {
    if(scope.enableZoom) handleTouchStartDolly(event)
    if(scope.enableRotate) handleTouchStartRotate(event)
  }

  function handleTouchMoveRotate(event) {

    if(event.touches.length === 1) {
      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)
      rotateEnd.set(x, y)
    }

    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed)
    let element = scope.domElement
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight) // yes, height
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight)
    rotateStart.copy(rotateEnd)
  }

  function handleTouchMovePan(event) {
    if(event.touches.length === 1) {
      panEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)
      panEnd.set(x, y)
    }

    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)
    pan(panDelta.x, panDelta.y)
    panStart.copy(panEnd)
  }

  function handleTouchMoveDolly(event) {
    let dx = event.touches[0].pageX - event.touches[1].pageX
    let dy = event.touches[0].pageY - event.touches[1].pageY
    let distance = Math.sqrt(dx * dx + dy * dy)
    dollyEnd.set(0, distance)
    dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed))
    dollyOut(dollyDelta.y)
    dollyStart.copy(dollyEnd)
  }

  function handleTouchMoveDollyPan(event) {
    if(scope.enableZoom) handleTouchMoveDolly(event)
    if(scope.enablePan) handleTouchMovePan(event)
  }

  function handleTouchMoveDollyRotate(event) {
    if(scope.enableZoom) handleTouchMoveDolly(event)
    if(scope.enableRotate) handleTouchMoveRotate(event)
  }

  function handleTouchEnd(/*event*/) {

    // no-op

  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  function onPointerDown(event) {
    if(scope.enabled === false) return

    switch (event.pointerType) {

    case 'mouse':
    case 'pen':
      onMouseDown(event)
      break
    default:
      break
			// TODO touch

    }

  }

  // 鼠标按下并移动获鼠标第一次按下并获取焦点时触发
  function onPointerMove(event) {
    if(scope.enabled === false) return

    switch (event.pointerType) {

    case 'mouse':
    case 'pen':
      onMouseMove(event)
      break
    default:
      break
			// TODO touch

    }

  }

  function onPointerUp(event) {

    switch (event.pointerType) {

    case 'mouse':
    case 'pen':
      onMouseUp(event)
      break
    default:
      break
			// TODO touch

    }

  }

  // 事件处理程序-FSM：侦听事件并重置状态
  function onMouseDown(event) {
    event.preventDefault()

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.

    scope.domElement.focus ? scope.domElement.focus() : window.focus()

    let mouseAction
    // 区分是哪个鼠标按钮
    switch (event.button) {

    case 0:
      mouseAction = scope.mouseButtons.LEFT
      break

    case 1:
      mouseAction = scope.mouseButtons.MIDDLE
      break

    case 2:
      mouseAction = scope.mouseButtons.RIGHT
      break

    default:
      mouseAction = - 1
    }

    switch (mouseAction) {

    case THREE.MOUSE.DOLLY:
      // 鼠标滑动键，缩放响应
      if(scope.enableZoom === false) return
      handleMouseDownDolly(event)
      state = STATE.DOLLY
      break

    case THREE.MOUSE.ROTATE:
      // 鼠标左键响应
      if(scope.enablePan) {
        leftPointEven.clientX = event.clientX
        leftPointEven.clientY = event.clientY
      }
      // 同时按下ctrl键、shift键或者window键（苹果的 ⌘ 键）时等同按下的是右键
      if(event.ctrlKey || event.metaKey || event.shiftKey) {
        if(scope.enablePan === false) return
        handleMouseDownPan(event)
        state = STATE.PAN
      } else {
        if(scope.enableRotate === false) return
        handleMouseDownRotate(event)
        state = STATE.ROTATE
      }
      break

    case THREE.MOUSE.PAN:
      // 鼠标右键响应
      if(scope.enablePan) {
        rightPointEven.clientX = event.clientX
        rightPointEven.clientY = event.clientY
      }
      // 同时按下ctrl键、shift键或者window键（苹果的 ⌘ 键）时等同按下的是左键
      if(event.ctrlKey || event.metaKey || event.shiftKey) {
        if(scope.enableRotate === false) return
        handleMouseDownRotate(event)
        state = STATE.ROTATE
      } else {
        if(scope.enablePan === false) return
        handleMouseDownPan(event)
        state = STATE.PAN
      }
      break

    default:
      state = STATE.NONE
    }

    if(state !== STATE.NONE) {

      scope.domElement.ownerDocument.addEventListener('pointermove', onPointerMove, false)
      scope.domElement.ownerDocument.addEventListener('pointerup', onPointerUp, false)

      scope.dispatchEvent(startEvent)

    }

  }

  function onMouseMove(event) {

    if(scope.enabled === false) return

    event.preventDefault()

    switch (state) {

    case STATE.ROTATE:

      if(scope.enableRotate === false) return

      handleMouseMoveRotate(event)

      break

    case STATE.DOLLY:

      if(scope.enableZoom === false) return

      handleMouseMoveDolly(event)

      break

    case STATE.PAN:

      if(scope.enablePan === false) return

      handleMouseMovePan(event)

      break
    default:
      break
    }

  }

  function onMouseUp(event) {

    scope.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, false)
    scope.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp, false)

    if(scope.enabled === false) return

    handleMouseUp(event)

    scope.dispatchEvent(endEvent)

    state = STATE.NONE

  }

  function onMouseWheel(event) {
    if(scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return

    event.preventDefault()
    event.stopPropagation()

    scope.dispatchEvent(startEvent)

    handleMouseWheel(event)

    scope.dispatchEvent(endEvent)

  }

  function onKeyDown(event) {
    if(scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return

    handleKeyDown(event)

  }

  function onTouchStart(event) {
    if(scope.enabled === false) return
    event.preventDefault() // prevent scrolling
    switch (event.touches.length) {
    case 1:
      switch (scope.touches.ONE) {
      case THREE.TOUCH.ROTATE:
        if(scope.enableRotate === false) return
        handleTouchStartRotate(event)
        state = STATE.TOUCH_ROTATE
        break

      case THREE.TOUCH.PAN:
        if(scope.enablePan === false) return
        handleTouchStartPan(event)
        state = STATE.TOUCH_PAN
        break
      default:
        state = STATE.NONE
      }
      break

    case 2:
      switch (scope.touches.TWO) {
      case THREE.TOUCH.DOLLY_PAN:
        if(scope.enableZoom === false && scope.enablePan === false) return
        handleTouchStartDollyPan(event)
        state = STATE.TOUCH_DOLLY_PAN
        break

      case THREE.TOUCH.DOLLY_ROTATE:
        if(scope.enableZoom === false && scope.enableRotate === false) return
        handleTouchStartDollyRotate(event)
        state = STATE.TOUCH_DOLLY_ROTATE
        break
      default:
        state = STATE.NONE
      }
      break

    default:
      state = STATE.NONE
    }
    if(state !== STATE.NONE) {
      scope.dispatchEvent(startEvent)
    }
  }

  function onTouchMove(event) {

    if(scope.enabled === false) return
    event.preventDefault() // prevent scrolling
    event.stopPropagation()
    switch (state) {
    case STATE.TOUCH_ROTATE:
      if(scope.enableRotate === false) return
      handleTouchMoveRotate(event)
      scope.update()
      break

    case STATE.TOUCH_PAN:
      if(scope.enablePan === false) return
      handleTouchMovePan(event)
      scope.update()
      break

    case STATE.TOUCH_DOLLY_PAN:
      if(scope.enableZoom === false && scope.enablePan === false) return
      handleTouchMoveDollyPan(event)
      scope.update()
      break

    case STATE.TOUCH_DOLLY_ROTATE:
      if(scope.enableZoom === false && scope.enableRotate === false) return
      handleTouchMoveDollyRotate(event)
      scope.update()
      break

    default:
      state = STATE.NONE
    }
  }

  function onTouchEnd(event) {
    if(scope.enabled === false) return
    handleTouchEnd(event)
    scope.dispatchEvent(endEvent)
    state = STATE.NONE
  }

  function onContextMenu(event) {
    if(scope.enabled === false) return
    event.preventDefault()
  }

  function onMousemove(event) {
    event.preventDefault()
    if(!intersected) {
      return
    }
    moveEvent = event
  }

  function getParent(obj) {
    if(obj.parent) {
      let {parent} = obj
      if(parent.name && parent.name !== '' && parent.name !== 'Object3D') {
        return parent
      }
      return getParent(parent)
    }
    return null
  }

  this.handleMove = function () {
    if(intersected && moveEvent) {
      const intersects = getIntersects(moveEvent)
      const intParent = getParent(intersected)
      if(intersects.length > 0 && intParent) {
        let point = new THREE.Vector3()
        let i = 0
        for(;i < intersects.length; i++) {
          const iParent = getParent(intersects[i].object)
          if(iParent && intParent !== iParent) {
            Object.assign(point, intersects[i].point)
            break
          }
        }
        if(point) {
          if(point.y < 0) {
            point.y = 0
          }
          Object.assign(intParent.position, point)
        }
      }
      moveEvent = null
    }
  }

  scope.domElement.addEventListener('contextmenu', onContextMenu, false)

  // 鼠标按下事件
  scope.domElement.addEventListener('pointerdown', onPointerDown, false)
  // 鼠标滑动键滑动监听
  scope.domElement.addEventListener('wheel', onMouseWheel, false)
  // 鼠标移动监听
  scope.domElement.addEventListener('mousemove', onMousemove, false)

  // 移动端触摸事件
  scope.domElement.addEventListener('touchstart', onTouchStart, false)
  scope.domElement.addEventListener('touchend', onTouchEnd, false)
  scope.domElement.addEventListener('touchmove', onTouchMove, false)

  // 键盘键监听
  window.addEventListener('keydown', onKeyDown, false)

  // force an update at start

  this.update()

}

OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype)
OrbitControls.prototype.constructor = OrbitControls


//这组控件执行动态观察、推拉（缩放）和平移。
//与轨迹球控制不同，它保持“向上”方向对象.向上（默认为+Y）。
//这与OrbitControls非常相似，这是另一组触摸行为
//动态观察-鼠标右键或鼠标左键+ctrl/meta/Shift键/触摸：两个手指旋转
//缩放-鼠标中键或鼠标滚轮/触摸：两个手指展开或挤压
//平移-鼠标左键或箭头键/触摸：一个手指移动

// MapControls = function (object, domElement) {

//   OrbitControls.call(this, object, domElement)
//   this.screenSpacePanning = false // pan orthogonal to world-space direction camera.up

//   this.mouseButtons.LEFT = THREE.MOUSE.PAN
//   this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE

//   this.touches.ONE = THREE.TOUCH.PAN
//   this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE

// }

// MapControls.prototype = Object.create(THREE.EventDispatcher.prototype).
//   MapControls.prototype.constructor = MapControls
