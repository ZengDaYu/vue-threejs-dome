<template>
  <Object3D  :rotation="rota">
    <slot></slot>
    <animation :fn="goFly" :paused="paused"></animation>
  </Object3D>
</template>

<script>
import { Clock, Vector3 } from 'three'
import _OrbitControls from '@/threex/controls/OrbitControls'
import Object3D from '@/components/Object3D'
import Animation from '@/components/Animation'

export default {
  name: 'OrbitControls',
  mixins: [Object3D],
  components: {
    Object3D,
    Animation
  },
  inject: ['global'],
  props: {
    rota: { type: Object, default() {
      return { y: Math.PI }
    }},
    autoRotate: {
      type: Boolean, default: false
    },
    target: {
      type: Object
    },
    // 相机飞行到的焦点
    flayTo: {
      type: Object, default() {
        return {
          x: 0,
          y: 0,
          z: 0
        }
      }
    },
    // 相机飞行的偏移量，偏移量+焦点=真实位置
    offset: {
      type: Object, default() {
        return {
          x: 0,
          y: 0,
          z: 0
        }
      }
    },
    isFly: {
      type: Boolean, default: false
    }
  },

  data() {
    return {
      controls: null,
      timer: null,
      frame: null,
      paused: true,
      flyObject: {
        // 每次移动的具体值
        x: 0,
        y: 0,
        z: 0,
        count: 10,
        passed: 0
      }
    }
  },

  watch: {
    isFly(v) {
      if(v) {
        this.flyObject.x = this.getPosition('x')
        this.flyObject.y = this.getPosition('y')
        this.flyObject.z = this.getPosition('z')
        this.controls.target = new Vector3(this.flayTo.x, this.flayTo.y, this.flayTo.z)
      } else {
        this.controls.target = new Vector3(0, 0, 0)
        this.curObj.position = new Vector3(9, 21, 20)
      }
      this.paused = !v
    },
    autoRotate (v) {
      this.controls.autoRotate = v
    },
    target: {
      deep: true,
      handler(v) {
        const x = v.x || 0
        const y = v.y || 0
        const z = v.z || 0
        this.controls.target = new Vector3(x, y, z)
      }
    }
  },

  mounted() {
    let domElement = this.global.rendererDom
    this.controls = new _OrbitControls(this.curObj, domElement, this.global)
    this.global.controls = this.controls
    this.timer = new Clock()
    this.frame = this.animate()

  },
  beforeDestroy() {
    if(this.frame) {
      cancelAnimationFrame(this.frame)
    }
    if(this.controls) {
      this.controls.dispose()
    }
  },

  methods: {
    animate() {
      this.frame = requestAnimationFrame(this.animate)
      this.controls.handleMove()
      this.controls.update(this.timer.getDelta())
    },
    goFly() {
      if(this.flyObject.passed >= this.flyObject.count) {
        this.paused = true
        this.flyObject.passed = 0
        return
      }
      this.flyObject.passed += 1
      let x, y, z
      x = this.getAdd('x')
      y = this.getAdd('y')
      z = this.getAdd('z')
      this.curObj.position = new Vector3(x, y, z)
    },
    getPosition(o) {
      if(!this.controls) {
        return 0
      }
      let x = this.curObj.position[o] - (this.flayTo[o] + this.offset[o])
      x /= this.flyObject.count
      return x
    },
    getAdd(o) {
      if(!this.controls) {
        return 0
      }
      return this.curObj.position[o] - this.flyObject[o]
    }
  }
}
</script>
