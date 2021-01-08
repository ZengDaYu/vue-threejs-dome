<template>
  <div>
    <slot></slot>
    <div ref="container"></div>
  </div>
</template>

<script>
import { WebGLRenderer, PerspectiveCamera } from 'three'

export default {
  name: 'Renderer',

  provide() {
    return {
      parentObj: null, // avoid "injection not found" warning
      _baseUrl: null,
      global: this.global
    }
  },

  props: {
    limes: {
      type: Boolean, default: false
    },
    size: {
      type: Object, // { w, h }
      required: true
    },
    obj: { type: Object }
  },

  watch: {
    limes (v) {
      if(v) {
        this.global.controls.useStroke(this.curObj)
      }
      this.global.controls.stroked = v
    },
    size: {
      deep: true,
      handler(v) {
        if(this.global.camera instanceof PerspectiveCamera) {
          this.global.camera.aspect = v.w / v.h
        } else {
          this.global.camera.left = - v.w / 2
          this.global.camera.right = v.w / 2
          this.global.camera.top = v.h / 2
          this.global.camera.bottom = - v.h / 2
        }
        this.global.camera.updateProjectionMatrix()
        this.curObj.setSize(v.w, v.h)
      }
    }
  },

  data() {
    let curObj = this.obj

    if(!curObj) {
      curObj = new WebGLRenderer({ antialias: true })
      curObj.setClearColor(0x000000)
    }
    curObj.name = curObj.name || curObj.type
    curObj.setSize(this.size.w, this.size.h)
    // 开启才能显示阴影
    curObj.shadowMap.enabled = true

    // fixme: better solution for global vars
    let global = {}
    global.rendererSize = this.size
    global.rendererDom = curObj.domElement

    return { curObj, global }
  },

  mounted() {
    this.$refs.container.appendChild(this.curObj.domElement)
    this.animate()
  },

  methods: {
    animate() {
      requestAnimationFrame(this.animate)
      this.curObj.render(this.global.scene, this.global.camera)
      if(this.global.controls.stroked) {
        this.global.controls.composer.render()
      }
    }
  },
  destroyed () {
    this.curObj.dispose()
  }
}
</script>
