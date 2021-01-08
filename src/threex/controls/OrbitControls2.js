// old
/* eslint-disable */
import * as THREE from 'three'

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

//    动态观察-鼠标左键/触摸：一个手指移动
//    ？缩放-鼠标中键或鼠标滚轮/触摸：两个手指展开或挤压
//    ？平移-鼠标右键或箭头键/触摸：三个查找器滑动

export default function OrbitControls ( object, domElement ) {

  this.object = object

  this.domElement = ( domElement !== undefined ) ? domElement : document

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
  this.dampingFactor = 0.25

  // 相机推拉，体现为能否缩放
  this.enableZoom = true
  this.zoomSpeed = 1.0

  // 能否用鼠标拖动旋转
  this.enableRotate = true
  this.rotateSpeed = 1.0

  // 设置为false可禁用平移
  this.enablePan = true
  this.keyPanSpeed = 7.0 // pixels moved per arrow key push

  //设置为true可自动围绕目标旋转
  //如果启用了自动旋转，则必须调用控件更新（）在动画循环中
  this.autoRotate = false
  this.autoRotateSpeed = 2.0 // 30 seconds per round when fps is 60

  // 设置为false以禁用键盘的使用
  this.enableKeys = true

  // 键盘上能用的键
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }

  // 鼠标键
  this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT }

  // 初始值，用于重置
  this.target0 = this.target.clone()
  this.position0 = this.object.position.clone()
  this.zoom0 = this.object.zoom

  //
  // public methods
  //

  this.getPolarAngle = function () {

    return phi

  }

  this.getAzimuthalAngle = function () {

    return theta

  }

  // 重置
  this.reset = function () {

    scope.target.copy( scope.target0 )
    scope.object.position.copy( scope.position0 )
    scope.object.zoom = scope.zoom0

    scope.object.updateProjectionMatrix()
    scope.dispatchEvent( changeEvent )

    scope.update()

    state = STATE.NONE

  }

  this.update = function() {

    var offset = new THREE.Vector3()

    var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) )
    var quatInverse = quat.clone().invert()

    var lastPosition = new THREE.Vector3()
    var lastQuaternion = new THREE.Quaternion()

    return function () {

      var position = scope.object.position

      offset.copy( position ).sub( scope.target )

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion( quat )

      // angle from z-axis around y-axis
      spherical.setFromVector3( offset )

      if ( scope.autoRotate && state === STATE.NONE ) {

        rotateLeft( getAutoRotationAngle() )

      }

      if ( scope.enableDamping ) {
				spherical.theta += sphericalDelta.theta * scope.dampingFactor
				spherical.phi += sphericalDelta.phi * scope.dampingFactor
			} else {
				spherical.theta += sphericalDelta.theta
				spherical.phi += sphericalDelta.phi
			}

      // theta的范围
      spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) )

      // phi的范围
      spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) )

      spherical.makeSafe()


      spherical.radius *= scale

      // radius的范围
      spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) )

      // 将目标移动到平移位置
      scope.target.add( panOffset )

      offset.setFromSpherical( spherical )

      // 设置相机位置为上方
      offset.applyQuaternion( quatInverse )

      position.copy( scope.target ).add( offset )

      scope.object.lookAt( scope.target )

      if ( scope.enableDamping === true ) {

        sphericalDelta.theta *= ( 1 - scope.dampingFactor )
        sphericalDelta.phi *= ( 1 - scope.dampingFactor )

      } else {

        sphericalDelta.set( 0, 0, 0 )

      }

      scale = 1
      panOffset.set( 0, 0, 0 )

      //更新条件为：
      //最小值（摄影机置换，摄影机以弧度为单位旋转）^2>EPS
      //使用小角度近似cos（x/2）=1-x^2/8
      if ( zoomChanged ||
        lastPosition.distanceToSquared( scope.object.position ) > EPS ||
        8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

        scope.dispatchEvent( changeEvent )

        lastPosition.copy( scope.object.position )
        lastQuaternion.copy( scope.object.quaternion )
        zoomChanged = false

        return true

      }

      return false

    }

  }()

  this.dispose = function() {

    scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false )
    scope.domElement.removeEventListener( 'mousedown', onMouseDown, false )
    scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false )
    // scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ) // firefox

    scope.domElement.removeEventListener( 'touchstart', onTouchStart, false )
    scope.domElement.removeEventListener( 'touchend', onTouchEnd, false )
    scope.domElement.removeEventListener( 'touchmove', onTouchMove, false )

    document.removeEventListener( 'mousemove', onMouseMove, false )
    document.removeEventListener( 'mouseup', onMouseUp, false )
    document.removeEventListener( 'mouseout', onMouseUp, false )

    window.removeEventListener( 'keydown', onKeyDown, false )

    //scope.dispatchEvent( { type: 'dispose' } ) // should this be added here?

  }

  //
  // 内部构件
  //

  var scope = this

  var changeEvent = { type: 'change' }
  var startEvent = { type: 'start' }
  var endEvent = { type: 'end' }

  var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 }

  var state = STATE.NONE

  var EPS = 0.000001

  // 球坐标中的当前位置
  var spherical = new THREE.Spherical()
  var sphericalDelta = new THREE.Spherical()

  var scale = 1
  var panOffset = new THREE.Vector3()
  var zoomChanged = false

  var rotateStart = new THREE.Vector2()
  var rotateEnd = new THREE.Vector2()
  var rotateDelta = new THREE.Vector2()

  var panStart = new THREE.Vector2()
  var panEnd = new THREE.Vector2()
  var panDelta = new THREE.Vector2()

  var dollyStart = new THREE.Vector2()
  var dollyEnd = new THREE.Vector2()
  var dollyDelta = new THREE.Vector2()

  function getAutoRotationAngle() {

    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed

  }

  function getZoomScale() {

    return Math.pow( 0.95, scope.zoomSpeed )

  }

  function rotateLeft( angle ) {

    sphericalDelta.theta -= angle

  }

  function rotateUp( angle ) {

    sphericalDelta.phi -= angle

  }

  var panLeft = function() {

    var v = new THREE.Vector3()

    return function panLeft( distance, objectMatrix ) {

      v.setFromMatrixColumn( objectMatrix, 0 ) // 获取objectMatrix的X列
      v.multiplyScalar( - distance )

      panOffset.add( v )

    }

  }()

  var panUp = function() {

    var v = new THREE.Vector3()

    return function panUp( distance, objectMatrix ) {

      v.setFromMatrixColumn( objectMatrix, 1 ) // 获取objectMatrix的Y列
      v.multiplyScalar( distance )

      panOffset.add( v )

    }

  }()

  // deltaX和deltaY以像素为单位；right和down为正负
  var pan = function() {

    var offset = new THREE.Vector3()

    return function( deltaX, deltaY ) {

      var element = scope.domElement === document ? scope.domElement.body : scope.domElement

      if ( scope.object instanceof THREE.PerspectiveCamera ) {

        var position = scope.object.position
        offset.copy( position ).sub( scope.target )
        var targetDistance = offset.length()

        // 视场的一半在屏幕的中心到顶部
        targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 )

        // 实际上不使用屏幕宽度，因为透视相机是固定在屏幕上的
        panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix )
        panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix )

      } else if ( scope.object instanceof THREE.OrthographicCamera ) {

        // orthographic,直角？
        panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix )
        panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix )

      } else {

        // 相机既不是正交也不是透视，相机只有这两种类型
        console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' )
        scope.enablePan = false

      }

    }

  }()

  function dollyIn( dollyScale ) {

    if ( scope.object instanceof THREE.PerspectiveCamera ) {

      scale /= dollyScale

    } else if ( scope.object instanceof THREE.OrthographicCamera ) {

      scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) )
      scope.object.updateProjectionMatrix()
      zoomChanged = true

    } else {
      // 已禁用推拉/缩放
      console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' )
      scope.enableZoom = false

    }

  }

  function dollyOut( dollyScale ) {

    if ( scope.object instanceof THREE.PerspectiveCamera ) {

      scale *= dollyScale

    } else if ( scope.object instanceof THREE.OrthographicCamera ) {

      scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) )
      scope.object.updateProjectionMatrix()
      zoomChanged = true

    } else {
      // 已禁用推拉/缩放
      console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' )
      scope.enableZoom = false

    }

  }

  //
  // 旋转相机，起始点
  //
  function handleMouseDownRotate( event ) {

    // console.log( 'handleMouseDownRotate' )

    rotateStart.set( event.clientX, event.clientY )

  }

  // 相机缩放，起始点
  function handleMouseDownDolly( event ) {

    // console.log( 'handleMouseDownDolly' )

    dollyStart.set( event.clientX, event.clientY )

  }

  // 按下鼠标右键的回调
  function handleMouseDownPan( event ) {

    //console.log( 'handleMouseDownPan' )

    panStart.set( event.clientX, event.clientY )

  }

  // 旋转相机，移动时的回调
  function handleMouseMoveRotate( event ) {

    //console.log( 'handleMouseMoveRotate' )

    rotateEnd.set( event.clientX, event.clientY )
    rotateDelta.subVectors( rotateEnd, rotateStart )

    var element = scope.domElement === document ? scope.domElement.body : scope.domElement

    // 在整个屏幕上旋转360度
    rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed )

    // 沿整个屏幕上下旋转尝试360度，但限制在180度
    rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed )

    rotateStart.copy( rotateEnd )

    scope.update()

  }

  // 相机缩放时的回调
  function handleMouseMoveDolly( event ) {

    //console.log( 'handleMouseMoveDolly' )

    dollyEnd.set( event.clientX, event.clientY )

    dollyDelta.subVectors( dollyEnd, dollyStart )
    console.log(dollyDelta.y )

    if ( dollyDelta.y > 0 ) {

      dollyIn( getZoomScale() )

    } else if ( dollyDelta.y < 0 ) {

      dollyOut( getZoomScale() )

    }

    dollyStart.copy( dollyEnd )

    scope.update()

  }

  // 鼠标右键按下后移动的回调
  function handleMouseMovePan( event ) {

    //console.log( 'handleMouseMovePan' )
    panEnd.set( event.clientX, event.clientY )
    panDelta.subVectors( panEnd, panStart )
    pan( panDelta.x, panDelta.y )
    panStart.copy( panEnd )
    scope.update()
  }

  function handleMouseUp( event ) {

    //console.log( 'handleMouseUp' )

  }

  // 适配浏览器滚动条
  function handleMouseWheel( event ) {
    //console.log( 'handleMouseWheel' )
    var delta = 0
    if ( event.wheelDelta !== undefined ) {
      // WebKit / Opera / Explorer 9
      delta = event.wheelDelta
    } else if ( event.detail !== undefined ) {
      // Firefox
      delta = - event.detail
    }
    if ( delta > 0 ) {
      dollyOut( getZoomScale() )
    } else if ( delta < 0 ) {
      dollyIn( getZoomScale() )
    }
    scope.update()
  }

  // 键盘按键响应
  function handleKeyDown( event ) {
    console.log( 'handleKeyDown:'+event.keyCode )
    switch ( event.keyCode ) {

      case scope.keys.UP:
        pan( 0, scope.keyPanSpeed )
        scope.update()
        break

      case scope.keys.BOTTOM:
        pan( 0, - scope.keyPanSpeed )
        scope.update()
        break

      case scope.keys.LEFT:
        pan( scope.keyPanSpeed, 0 )
        scope.update()
        break

      case scope.keys.RIGHT:
        pan( - scope.keyPanSpeed, 0 )
        scope.update()
        break

    }

  }

  function handleTouchStartRotate( event ) {

    //console.log( 'handleTouchStartRotate' )

    rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )

  }

  function handleTouchStartDolly( event ) {

    console.log( 'handleTouchStartDolly' )

    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX
    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY

    var distance = Math.sqrt( dx * dx + dy * dy )

    dollyStart.set( 0, distance )

  }

  function handleTouchStartPan( event ) {

    //console.log( 'handleTouchStartPan' )

    panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )

  }

  function handleTouchMoveRotate( event ) {

    //console.log( 'handleTouchMoveRotate' )

    rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )
    rotateDelta.subVectors( rotateEnd, rotateStart )

    var element = scope.domElement === document ? scope.domElement.body : scope.domElement

    // rotating across whole screen goes 360 degrees around
    rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed )

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed )

    rotateStart.copy( rotateEnd )

    scope.update()

  }

  function handleTouchMoveDolly( event ) {

    //console.log( 'handleTouchMoveDolly' )

    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX
    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY

    var distance = Math.sqrt( dx * dx + dy * dy )

    dollyEnd.set( 0, distance )

    dollyDelta.subVectors( dollyEnd, dollyStart )

    if ( dollyDelta.y > 0 ) {

      dollyOut( getZoomScale() )

    } else if ( dollyDelta.y < 0 ) {

      dollyIn( getZoomScale() )

    }

    dollyStart.copy( dollyEnd )

    scope.update()

  }

  function handleTouchMovePan( event ) {

    //console.log( 'handleTouchMovePan' )

    panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY )

    panDelta.subVectors( panEnd, panStart )

    pan( panDelta.x, panDelta.y )

    panStart.copy( panEnd )

    scope.update()

  }

  function handleTouchEnd( event ) {

    //console.log( 'handleTouchEnd' )

  }

  //
  // 事件处理程序-FSM：侦听事件并重置状态
  //

  function onMouseDown( event ) {

    if ( scope.enabled === false ) return

    event.preventDefault()

    if ( event.button === scope.mouseButtons.ORBIT ) {

      if ( scope.enableRotate === false ) return

      handleMouseDownRotate( event )

      state = STATE.ROTATE

    } else if ( event.button === scope.mouseButtons.ZOOM ) {

      if ( scope.enableZoom === false ) return

      handleMouseDownDolly( event )

      state = STATE.DOLLY

    } else if ( event.button === scope.mouseButtons.PAN ) {

      if ( scope.enablePan === false ) return

      handleMouseDownPan( event )

      state = STATE.PAN

    }

    if ( state !== STATE.NONE ) {

      document.addEventListener( 'mousemove', onMouseMove, false )
      document.addEventListener( 'mouseup', onMouseUp, false )
      document.addEventListener( 'mouseout', onMouseUp, false )

      scope.dispatchEvent( startEvent )

    }

  }

  function onMouseMove( event ) {

    if ( scope.enabled === false ) return

    event.preventDefault()

    if ( state === STATE.ROTATE ) {

      if ( scope.enableRotate === false ) return

      handleMouseMoveRotate( event )

    } else if ( state === STATE.DOLLY ) {

      if ( scope.enableZoom === false ) return

      handleMouseMoveDolly( event )

    } else if ( state === STATE.PAN ) {

      if ( scope.enablePan === false ) return

      handleMouseMovePan( event )

    }

  }

  function onMouseUp( event ) {

    if ( scope.enabled === false ) return

    handleMouseUp( event )

    document.removeEventListener( 'mousemove', onMouseMove, false )
    document.removeEventListener( 'mouseup', onMouseUp, false )
    document.removeEventListener( 'mouseout', onMouseUp, false )

    scope.dispatchEvent( endEvent )

    state = STATE.NONE

  }

  function onMouseWheel( event ) {

    console.log(event)
    console.log(scope.enableZoom )
    console.log(state )
    if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return

    event.preventDefault()
    event.stopPropagation()
    handleMouseWheel( event )

    scope.dispatchEvent( startEvent ) // not sure why these are here...
    scope.dispatchEvent( endEvent )

  }

  function onKeyDown( event ) {
    console.log(event)
    if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return

    handleKeyDown( event )

  }

  // 手机触屏响应
  function onTouchStart( event ) {
    if ( scope.enabled === false ) return
    switch ( event.touches.length ) {
      case 1: // one-fingered touch: rotate
        if ( scope.enableRotate === false ) return
        handleTouchStartRotate( event )
        state = STATE.TOUCH_ROTATE
        break

      case 2: // two-fingered touch: dolly
        if ( scope.enableZoom === false ) return
        handleTouchStartDolly( event )
        state = STATE.TOUCH_DOLLY
        break

      case 3: // three-fingered touch: pan
        if ( scope.enablePan === false ) return
        handleTouchStartPan( event )
        state = STATE.TOUCH_PAN
        break

      default:
        state = STATE.NONE

    }

    if ( state !== STATE.NONE ) {
      scope.dispatchEvent( startEvent )
    }

  }

  // 手机触屏触摸移动时的响应
  function onTouchMove( event ) {
    if ( scope.enabled === false ) return
    event.preventDefault()
    event.stopPropagation()

    switch ( event.touches.length ) {
      case 1: // one-fingered touch: rotate
        if ( scope.enableRotate === false ) return
        if ( state !== STATE.TOUCH_ROTATE ) return // is this needed?...
        handleTouchMoveRotate( event )

        break

      case 2: // two-fingered touch: dolly
        if ( scope.enableZoom === false ) return
        if ( state !== STATE.TOUCH_DOLLY ) return // is this needed?...
        handleTouchMoveDolly( event )
        break

      case 3: // three-fingered touch: pan
        if ( scope.enablePan === false ) return
        if ( state !== STATE.TOUCH_PAN ) return // is this needed?...
        handleTouchMovePan( event )
        break

      default:
        state = STATE.NONE

    }

  }

  function onTouchEnd( event ) {
    if ( scope.enabled === false ) return
    handleTouchEnd( event )
    scope.dispatchEvent( endEvent )
    state = STATE.NONE
  }

  function onContextMenu( event ) {
    event.preventDefault()
  }

  //添加需要的监听器
  scope.domElement.addEventListener( 'contextmenu', onContextMenu, false )

  scope.domElement.addEventListener( 'mousedown', onMouseDown, false )
  scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false )
  // scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ) // firefox

  scope.domElement.addEventListener( 'touchstart', onTouchStart, false )
  scope.domElement.addEventListener( 'touchend', onTouchEnd, false )
  scope.domElement.addEventListener( 'touchmove', onTouchMove, false )

  window.addEventListener( 'keydown', onKeyDown, false )

  // 开始时强制更新
  this.update()

}

OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype )
OrbitControls.prototype.constructor = OrbitControls

Object.defineProperties( OrbitControls.prototype, {

  center: {
    get: function () {
      console.warn( 'THREE.OrbitControls: .center has been renamed to .target' )
      return this.target

    }

  },

  // 向后兼容
  noZoom: {
    get: function () {
      console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' )
      return ! this.enableZoom
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' )
      this.enableZoom = ! value
    }

  },

  noRotate: {
    get: function () {
      console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' )
      return ! this.enableRotate
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' )
      this.enableRotate = ! value
    }
  },

  noPan: {
    get: function () {
      console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' )
      return ! this.enablePan
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' )
      this.enablePan = ! value
    }

  },

  noKeys: {
    get: function () {
      console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' )
      return ! this.enableKeys
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' )
      this.enableKeys = ! value
    }

  },

  staticMoving : {
    get: function () {
      console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' )
      return ! this.constraint.enableDamping
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' )
      this.constraint.enableDamping = ! value
    }
  },

  dynamicDampingFactor : {
    get: function () {
      console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' )
      return this.constraint.dampingFactor
    },

    set: function ( value ) {
      console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' )
      this.constraint.dampingFactor = value
    }
  }

} )
