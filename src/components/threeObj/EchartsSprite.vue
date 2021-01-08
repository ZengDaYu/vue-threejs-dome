<template>
  <!-- <mesh v-if="show" name="Cube">
    <geometry type="Box" :args="[size, size, size]"></geometry>
    <material type="MeshBasic" :options="matOpts">
      <texture :canvas="canvas"/>
    </material>
  </mesh> -->
  <mesh v-if="show" name="Sprite" type="Sprite">
    <material type="Sprite" :options="matOpts">
      <texture :canvas="canvas"/>
    </material>
  </mesh>
</template>

<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'EchartsCube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    }
  },
  data() {
    return {
      matOpts: {
      },
      show: false,
      canvas: null
    }
  },
  mounted() {
    this.getCanvas()
  },
  methods: {
    async getCanvas() {
      let canvas = document.createElement('canvas')
      let myChart = this.$echarts.init(canvas)
      // 指定图表的配置项和数据
      let option = {
        title: {
        },
        tooltip: {},
        legend: {
          // data: ['销量']
        },
        backgroundColor: '#6abe75',
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
      let that = this
      await myChart.on('finished', () => {
        that.show = true
        that.canvas = canvas
      })
    }
  }
}
</script>
