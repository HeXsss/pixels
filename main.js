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
      this.image = document.getElementById("photo")
      this.gap = 5
      this.mouse = {
        radius: 6000,
        x: undefined,
        y: undefined
      }
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.x
        this.mouse.y = e.y
      })
      this.init(ctx)
    }
    init(context) {
      context.drawImage(
        this.image,
        this.width / 2 - this.image.width / 2,
        this.height / 2 - this.image.height / 2
      )
      const { data } = context.getImageData(0, 0, this.width, this.height)
      if (!data) return
      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {
          const index = (y * this.width + x) * 4
          const { r, g, b, a } = {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
          }
          if (a > 0) {
            const color = `rgba(${r},${g},${b},${a})`
            this.particlesArray.push(new Particle(this, x, y, color))
          }
        }
      }
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
  })
})
