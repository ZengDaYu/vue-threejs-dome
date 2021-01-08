<template>
  <div>
    <slot></slot>
    <animation v-if="world" :fn="animate"></animation>
  </div>
</template>

<script>
import * as Oimo from 'oimo'
import Animation from '@/components/Animation'

export default {
  name: 'OimoWorld',
  provide () {
    return { world: this.world }
  },
  props: { options: Object },
  components: {
    Animation
  },

  data () {
    let opts = {
      gravity: [0, 0, 0], // 重力方向
      timestep: 1 / 60, //刷新频率，通常为60帧每秒
      broadphase: 2, //碰撞检测算法类型
      random: false //是否使用随机样本
    }
    Object.assign(opts, this.options)

    let world = new Oimo.World(opts)
    return { world }
  },

  destroyed () {
    this.world.clear()
  },

  methods: {
    animate () {
      this.world.step()
    }
  }
}
</script>
