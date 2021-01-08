<template>
  <div v-if="show" >
    <mesh name="SoundBall" :position="pos">
      <geometry type="Sphere" :args="[radius, segments, segments]"/>
      <material type="MeshLambert" :color="color">
        <texture v-if="texture" :url="`static/textures/${texture}.png`"/>
      </material>
    </mesh>
    <animation :fn="animate" :paused="paused"></animation>
  </div>
</template>

<script>
import Object3D from '@/components/Object3D'
import Animation from '@/components/Animation'
import { AudioLoader, PositionalAudio } from 'three'

export default {
  name: 'SoundBall',
  mixins: [Object3D],
  inject: ['global'],
  props: {
    radius: Number,
    segments: Number,
    texture: String,
    color: Number,
    paused: {
      type: Boolean, default: false
    }
  },
  components: {
    Animation
  },
  data() {
    return {
      pos: {y: 0},
      show: false,
      player: null,
      isDown: false
    }
  },
  mounted() {
    this.getMusic()
  },
  methods: {
    animate(tt) {
      const height = this.pos.y
      this.pos = { y: Math.sin(tt) * 6}
      if(this.pos.y < height) {
        this.isDown = true
      } else {
        if(this.isDown === true) {
          this.player.play()
          this.isDown = false
        }
      }
    },
    async getMusic() {
      let loader = new AudioLoader()
      const that = this
      this.player = new PositionalAudio(this.global.audioListener)
      await loader.load('static/sounds/ping_pong.mp3', function (buffer) {
        that.player.setBuffer(buffer)
        that.show = true
      })
    }
  }
}
</script>
