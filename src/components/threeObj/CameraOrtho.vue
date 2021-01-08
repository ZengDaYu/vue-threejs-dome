<script>
import { OrthographicCamera } from 'three'
import Object3D from '@/components/Object3D'

export default {
  name: 'cameraOrtho',
  mixins: [Object3D],
  inject: ['global'],
  props: {
    obj: { type: Object }
  },

  data() {
    let curObj = this.obj

    const { w, h } = this.global.rendererSize
    if(!curObj) {
      // curObj = new PerspectiveCamera(75, w / h, 0.1, 1000)
      curObj = new OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, 1, 1000)
    }
    curObj.name = curObj.name || curObj.type
    curObj.position.z = 10

    return { curObj }
  },

  mounted() {
    this.global.camera = this.curObj
  }
}
</script>
