<template>
  <mesh name="Cube" :scale="scales">
    <geometry type="Box" :args="[size, size, size]"></geometry>
    <material type="MeshBasic" :visible="visible">
      <texture :url="`static/textures/${texture}.png`"></texture>
    </material>
    <animation :fn="animate" :paused="paused"></animation>
  </mesh>
</template>

<script>
import Object3D from '@/components/Object3D'
import Animation from '@/components/Animation'

export default {
  name: 'ScaleCube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    },
    paused: {
      type: Boolean, default: false
    }
  },
  components: {
    Animation
  },
  data() {
    return {
      scales: 1,
      speed: 0.01,
      max: 3,
      min: 0.5,
      begger: true
    }
  },
  methods: {
    animate() {
      if(this.begger) {
        this.scales += this.speed
        if(this.scales >= this.max) {
          this.begger = false
        }
      } else {
        this.scales -= this.speed
        if(this.scales <= this.min) {
          this.begger = true
        }
      }
    }
  }
}
</script>
