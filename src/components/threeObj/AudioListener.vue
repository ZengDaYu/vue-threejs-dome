<script>
import { AudioListener } from 'three'
import Object3D from '@/components/Object3D'

export default {
  name: 'AudioListener',
  mixins: [Object3D],
  inject: ['global'],

  data() {
    let listener = new AudioListener()
    this.global.audioListener = listener // fixme
    return { listener }
  }
}
</script>
