<script>
import Base from '@/components/Base'
import * as THREE from 'three'

export default {
  name: 'EdgesGeometry',
  mixins: [Base],
  inject: ['meshVm'],
  props: {
    args: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    thresholdAngle: { type: Number, default: 1 }
  },

  data() {
    let mod = `${this.type}Geometry`
    let inGeometry = new THREE[mod](...this.args)
    let geometry = new THREE.EdgesGeometry(inGeometry, this.thresholdAngle)
    return { geometry }
  },

  mounted() {
    this.meshVm.curObj.geometry = this.geometry
  },

  beforeDestroy() {
    this.meshVm.curObj.geometry = null
    this.geometry.dispose()
  }
}
</script>
