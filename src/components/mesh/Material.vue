<script>
import Base from '@/components/Base'
import * as THREE from 'three'

export default {
  name: 'Material',
  mixins: [Base],
  inject: ['meshVm'],
  props: {
    options: { type: Object, default: () => ({}) },
    color: { type: Number, default: 0xffffff },
    opacity: { type: Number },
    visible: { type: Boolean, default: true},
    type: { type: String, default: '' }
  },

  data () {
    let mod = `${this.type}Material`
    let opts = { ...this.options }
    if(this.color) opts.color = this.color
    opts.visible = this.visible
    // opts.wireframe = false // 是否渲染为线框
    opts.transparent = true // 开启透明
    let material = new THREE[mod](opts)
    return { material }
  },
  watch: {
    visible: {
      deep: true,
      handler(v) {
        this.material.visible = v
      }
    },
    color: {
      deep: true,
      handler(v) {
        this.material.color.set(v)
      }
    },
    opacity: {
      deep: true,
      handler(v) {
        this.material.opacity = v
      }
    },
    curObj(obj, oldObj) {
      this.unsetObj(oldObj)
      this.setObj(obj)
    }
  },
  provide () {
    return { material: this.material }
  },

  mounted () {
    if(this.meshVm) {
      this.meshVm.curObj.material = this.material
    }
  },
  beforeDestroy () {
    if(this.meshVm) {
      this.meshVm.curObj.material = null
    }
    this.material.dispose()
  }
}
</script>
