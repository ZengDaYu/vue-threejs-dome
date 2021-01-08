<template>
  <div>
    <div v-if="show">
      <mesh  name="Text">
        <geometry type="Text" :args="textData"></geometry>
        <material type="MeshBasic" :color="color" :visible="visible">
          <texture v-if="texture" :url="`static/textures/${texture}.png`"></texture>
        </material>
      </mesh>
      <line-segments v-if="showLine">
          <edges-geometry type="Text" :args="textData"/>
          <material type="LineBasic" :color="color" />
      </line-segments>
    </div>
  </div>
</template>

<script>
import Object3D from '@/components/Object3D'
import { FontLoader } from 'three'

export default {
  name: 'Text3D',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    color: Number,
    showLine: {
      type: Boolean, default: false
    },
    visible: {
      type: Boolean, default: true
    }
  },
  data() {
    return {
      textData: [],
      show: false
    }
  },
  mounted() {
    this.getFont()
  },
  methods: {
    async getFont() {
      let loader = new FontLoader()
      const that = this
      await loader.load('static/fonts/helvetiker_bold.typeface.json', function(v) {
        that.textData = ['3D文字',
          {
            font: v,
            //尺寸
            size: 5,
            //厚度
            height: 3}
        ]
        that.show = true
      })
    }
  }
}
</script>
