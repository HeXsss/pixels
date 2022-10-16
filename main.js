window.addEventListener("load", () => {
  const canvas = document.getElementById("Screen")
  const ctx = canvas.getContext("2d")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect
      this.x = x
      this.y = y
      this.originX = Math.floor(x)
      this.originY = Math.floor(y)
      this.color = color
      this.size = this.effect.gap
      this.ease = 0.2
      this.dx = 0.0
      this.dy = 0.0
      this.vx = 0.0
      this.vy = 0.0
      this.distance = 0.0
      this.force = 0.0
      this.angle = 0.0
      this.friction = 0.95
    }
    draw(context) {
      context.fillStyle = this.color
      context.fillRect(this.x, this.y, this.size, this.size)
    }
    update() {
      this.dx = this.effect.mouse.x - this.x
      this.dy = this.effect.mouse.y - this.y
      this.distance = this.dx * this.dx + this.dy * this.dy
      this.force = -this.effect.mouse.radius / this.distance
      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx)
        this.vx += this.force * Math.cos(this.angle)
        this.vy += this.force * Math.sin(this.angle)
      }
      // Recovering
      this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
      this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
    }
    warp() {
      this.x = Math.random() * this.effect.width
      this.y = Math.random() * this.effect.height
      this.ease = 0.05
    }
  }

  class Effect {
    constructor(width, height) {
      this.width = width
      this.height = height
      this.particlesArray = []
      this.image = new Image()
      this.gap = 5
      this.imageData = null
      this.mouse = {
        radius: 6000,
        x: undefined,
        y: undefined
      }
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.pageX
        this.mouse.y = e.pageY
      })
      window.addEventListener("mouseleave", (e) => {
        this.mouse.x = undefined
        this.mouse.y = undefined
      })
      window.addEventListener("touchmove", (e) => {
        this.mouse.x = e.pageX
        this.mouse.y = e.pageY
      })
      window.addEventListener("touchend", (e) => {
        this.mouse.x = undefined
        this.mouse.y = undefined
      })
      // this.init(ctx)
      this.image.onload = () => {
        this.init(ctx)
      }
      // Gap adjuster
      this.gapAdjuster = document.getElementById("gapAmount")
      this.gapAdjuster.addEventListener("input", (e) => {
        const value = e.target.value
        this.gap = Number(value)
        if (this.imageData) {
          this.updatePixels()
        }
      })
      // Radius adjuster
      this.radiusAdjuster = document.getElementById("radiusValue")
      this.radiusAdjuster.addEventListener("input", (e) => {
        this.mouse.radius = e.target.value
      })
    }
    loadImage(base) {
      ctx.clearRect(0, 0, this.width, this.height)
      this.image.src = base
      this.gapAdjuster.value = 5
      this.gap = 5
      this.mouse.radius = 3000
      this.radiusAdjuster.value = 3000
    }
    updatePixels() {
      this.particlesArray = []
      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {
          const index = (y * this.width + x) * 4
          const { r, g, b, a } = {
            r: this.imageData[index],
            g: this.imageData[index + 1],
            b: this.imageData[index + 2],
            a: this.imageData[index + 3]
          }
          if (a > 0) {
            const color = `rgba(${r},${g},${b},${a})`
            this.particlesArray.push(new Particle(this, x, y, color))
          }
        }
      }
    }
    init(context) {
      // get the top left position of the image
      const scaleWidth = this.image.width / this.image.height
      const scaleHeight = this.image.height / this.image.width
      if (this.height * scaleWidth <= this.width) {
        context.drawImage(
          this.image,
          this.width / 2 - (this.height * scaleWidth) / 2,
          0,
          this.height * scaleWidth,
          this.height
        )
      } else {
        context.drawImage(
          this.image,
          0,
          this.height / 2 - (this.width * scaleHeight) / 2,
          this.width,
          this.width * scaleHeight
        )
      }

      const { data } = context.getImageData(0, 0, this.width, this.height)
      this.imageData = data
      if (!data) return
      this.updatePixels()
    }
    draw(context) {
      this.particlesArray.forEach((particle) => particle.draw(context))
    }
    update() {
      this.particlesArray.forEach((particle) => particle.update())
    }
    warp() {
      this.particlesArray.forEach((particle) => particle.warp())
    }
  }

  const effect = new Effect(canvas.width, canvas.height)
  effect.draw(ctx)

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    effect.draw(ctx)
    effect.update()
    requestAnimationFrame(animate)
  }
  animate()

  // Warp button
  const warpButton = document.getElementById("warpButton")
  warpButton.addEventListener("click", () => {
    effect.warp()
    effect.mouse.x = undefined
    effect.mouse.y = undefined
  })

  const loader = document.getElementById("loadFile")
  const fileReader = new FileReader()
  fileReader.onloadend = (e) => {
    effect.loadImage(fileReader.result)
  }
  loader.addEventListener("change", (e) => {
    const { files } = e.target
    fileReader.readAsDataURL(files[0])
  })
})
