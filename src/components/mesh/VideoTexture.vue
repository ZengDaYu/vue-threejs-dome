<template>
  <video ref="videos" loop crossOrigin="anonymous" playsinline style="display:none">
    <source :src="url" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
  </video>
</template>
<script>
import { VideoTexture, LinearFilter, RGBFormat } from 'three'
import Base from '@/components/Base'

export default {
  name: 'Texture',
  mixins: [Base],
  inject: ['material'],
  props: {
    url: String,
    image: [Image, ImageData],
    options: { type: Object, default: () => ({}) }
  },

  data () {
    return { texture: null }
  },

  mounted () {
    let { ...rest } = this.options
    let video = this.$refs.videos
    video.play()
    this.texture = new VideoTexture(video)
    this.texture.minFilter = LinearFilter
    this.texture.magFilter = LinearFilter
    this.texture.format = RGBFormat
    Object.keys(rest).forEach(k => {
      if(k === 'repeat') {
        this.texture.repeat.set(...rest[k])
      } else {
        this.texture[k] = rest[k]
      }
    })

    this.material.map = this.texture
    this.$emit('update:obj', this.texture)
  },
  beforeDestroy () {
    this.$emit('update:obj', null)
  },
  destroyed () {
    this.material.map = null
    this.texture.dispose()
  }
}
</script>
