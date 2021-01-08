<template>
  <mesh name="Cube">
    <geometry type="Box" :args="[size, size, size]"></geometry>
    <material type="MeshLambert">
      <video-texture :url="'static/textures/sintel.mp4'"/>
    </material>
  </mesh>
</template>

<script>
import Object3D from '@/components/Object3D'

export default {
  name: 'VideoCube',
  mixins: [Object3D],
  props: {
    size: Number,
    texture: String,
    visible: {
      type: Boolean, default: true
    }
  }
}
</script>
