<script>
import * as THREE from 'three'
import Object3D from '@/components/Object3D'

export default {
  name: 'ShadowLight',
  mixins: [Object3D],

  props: {
    hex: Number,
    // 平行光的强度
    intensity: Number
  },

  data() {
    let curObj = this.obj
    if(!curObj) {
      curObj = new THREE.DirectionalLight(this.hex, this.intensity)
    }
    curObj.name = curObj.name || curObj.type
    curObj.shadow.mapSize.width = 1024 * 4
    curObj.shadow.mapSize.height = 1024 * 4

    const d = 300

    curObj.shadow.camera.left = - d
    curObj.shadow.camera.right = d
    curObj.shadow.camera.top = d
    curObj.shadow.camera.bottom = - d

    curObj.shadow.camera.far = 1000
    curObj.shadow.camera.near = 0.5
    return { curObj }
  }
}
</script>
