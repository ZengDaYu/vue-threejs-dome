<template>
  <mesh name="Sphere">
    <geometry type="Sphere" :args="[radius, segments, segments]"/>
    <material type="MeshLambert" :color="color" :opacity="opacity">
      <texture v-if="texture" :url="`static/textures/${texture}.png`"/>
    </material>
    <line-segments v-if="showLine">
      <edges-geometry type="Sphere" :args="[radius, segments, segments]"/>
      <material type="LineBasic" :color="color" />
    </line-segments>
  </mesh>
</template>

<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'Sphere',
  mixins: [Object3D],
  props: {
    radius: Number,
    segments: Number,
    opacity: Number,
    texture: String,
    showLine: {
      type: Boolean, default: false
    },
    color: Number,
    visible: {
      type: Boolean, default: true
    }
  }
}
</script>
