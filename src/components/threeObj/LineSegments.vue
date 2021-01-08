<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'LineSegments',
  mixins: [Object3D],
  props: {
    type: { type: String, default: 'LineSegments' }
  },

  provide () {
    return { meshVm: this }
  }
}
</script>
