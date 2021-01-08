<script>
import Object3D from '@/components/Object3D'
/**
 * options:
type ------ 物理物体的类型，球体、长方体、圆柱体
size ------ 物理物体的大小
pos ------ 物理物体的位置
rot ------ 物理物体的旋转角度
move ------ 物理物体是否是静态的
density ------ 物理物体的密度，可以用来增加物体的质量
friction ------ 物理物体的摩擦系数
restitution ------ 物理物体的弹性系数
belongsTo ------ 物理物体所属的组别
 *
 * */
export default {
  name: 'OimoBody',
  mixins: [Object3D],
  inject: ['world'],
  props: { options: Object },

  data () {
    return { body: null }
  },

  mounted () {
    let opts = {}
    Object.assign(opts, this.options)

    let body = this.world.add(opts)
    body.connectMesh(this.curObj)
    this.body = body

    // If you want to wait until the entire view has been rendered
    // https://vuejs.org/v2/api/#mounted
    this.$nextTick(() => {
      this.dispatchEvent('vm-oimo-body', body)
    })
  },

  beforeDestroy () {
    this.body.dispose()
    this.dispatchEvent('vm-oimo-body', null)
  }
}
</script>
