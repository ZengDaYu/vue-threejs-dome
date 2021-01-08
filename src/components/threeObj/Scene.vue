<script>
import * as THREE from 'three'
import Object3D from '@/components/Object3D'

export default {
  name: 'Scene',
  mixins: [Object3D],
  inject: ['global'],
  props: {
    obj: { type: Object },
    showFog: { type: Boolean, default: false}
  },

  data() {
    let curObj = this.obj
    if(!curObj) {
      curObj = new THREE.Scene()
    }
    curObj.name = curObj.name || curObj.type

    // 背景天空
    curObj.background = new THREE.Color(0xcce0ff)
    //雾效
    if(this.showFog) {
      curObj.fog = new THREE.Fog(0xffffff, 1, 100)
    }
    // curObj.fog = null
    // 环境光
    curObj.add(new THREE.AmbientLight(0x666666))
    return { curObj }
  },
  watch: {
    showFog: {
      deep: true,
      handler(v) {
        if(v) {
          this.curObj.fog = new THREE.Fog(0xffffff, 1, 100)
        } else {
          this.curObj.fog = null
        }
      }
    }
  },
  mounted() {
    let scene = this.curObj
    this.global.scene = scene
    // console.log(this.global.scene)
    // for threejs-inspector to work
    // https://github.com/jeromeetienne/threejs-inspector
    if(process.env.NODE_ENV === 'development') {
      window.THREE = THREE
      window.scene = scene
    }
  }
}
</script>
