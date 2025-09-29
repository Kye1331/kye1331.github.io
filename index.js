if (!localStorage.getItem('hasVisited')) {
alert("Apologies to those who have experienced the 'Christmas Update'. \n This was an unfortunate oversight on my end by sharing this project with some trollers. The website should be restored back to normal :) - me"");
localStorage.setItem('hasVisited', 'true');
}
const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 30;

function getRandomColor() {
  const colors = [
    "rgba(12,233,252,",
    "rgba(255, 182, 193,",
    "rgba(255, 255, 255,",
    "rgba(25,10,240,",
    "rgba(142,138,175,",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
class Boid {
  constructor(x, y) {
    this.x = x;
    this.y = x;
    this.radius = Math.random() * 15 + 5;
    this.dx = (Math.random() - 0.5) * 2;
    this.dy = (Math.random() - 0.5) * 2;
    this.opacity = Math.random() * (10 / this.radius);
    this.color = getRandomColor();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 50) this.dx += 0.01;
    if (this.x > canvas.width - 50) this.dx -= 0.01;
    if (this.y < 50) this.dy += 0.01;
    if (this.y > canvas.height - 50) this.dy -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color} ${this.opacity})`;
    ctx.shadowBlur = 50;
    ctx.shadowColor = this.color + "1)";
    ctx.fill();
    ctx.closePath();
  }
}

function init() {
  blurries = [];
  brights = [];
  for (let i = 0; i < particleCount; i++) {
    blurries.push(new Particle());
  }
  blurries.forEach((particle) => {
    particle.opacity = 0.05;
  });
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  for (let i = 0; i < 10; i++) {
    brights.push(new Particle());
  }
  brights.forEach((particle) => {
    particle.opacity = 1;
    particle.radius = 3;
  });
  particles = particles.concat(blurries, brights);

  animate();
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 15 + 5;
    this.dx = (Math.random() - 0.5) * 2;
    this.dy = (Math.random() - 0.5) * 2;
    this.opacity = Math.random() * (10 / this.radius);
    this.color = getRandomColor();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 50) this.dx += 0.01;
    if (this.x > canvas.width - 50) this.dx -= 0.01;
    if (this.y < 50) this.dy += 0.01;
    if (this.y > canvas.height - 50) this.dy -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color} ${this.opacity})`;
    ctx.shadowBlur = 50;
    ctx.shadowColor = this.color + "1)";
    ctx.fill();
    ctx.closePath();
  }
}

function init() {
  blurries = [];
  brights = [];
  for (let i = 0; i < particleCount; i++) {
    blurries.push(new Particle());
  }
  blurries.forEach((particle) => {
    particle.opacity = 0.05;
  });
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  for (let i = 0; i < 10; i++) {
    brights.push(new Particle());
  }
  brights.forEach((particle) => {
    particle.opacity = 1;
    particle.radius = 3;
  });
  particles = particles.concat(blurries, brights);

  animate();
}

function animate() {
  ctx.fillStyle = "#040440"; // Ensures dark purple remains solid without fading
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

init();
