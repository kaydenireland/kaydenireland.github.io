const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawStarfield() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let stars = createStars();
    animateStars(stars);
}

function createStars() {
    let stars = [];
    for (let i = 0; i < 500; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * .5 + 0.2,
            neighbors: []
        });
    }

    // assign random neighbors once
    stars.forEach((star, i) => {
        const neighborSet = new Set();
        while (neighborSet.size < 10) {
            const randomIndex = Math.floor(Math.random() * stars.length);
            if (randomIndex !== i) neighborSet.add(randomIndex);
        }
        star.neighbors = Array.from(neighborSet);
    });

    return stars;
}

function animateStars(stars) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';    // Space Color

    ctx.fillStyle = 'white';    // Star Color
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width;
        }
    });

    connectStars(stars); // Disable for just stars without lines

    requestAnimationFrame(() => animateStars(stars));

}

function distanceBetweenStars(star1, star2) {
    const dx = star1.x - star2.x;
    const dy = star1.y - star2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function connectStars(stars) {
    const maxDistance = 100;
    ctx.lineWidth = 0.5;

    stars.forEach(star => {
        star.neighbors.forEach(idx => {
            const neighbor = stars[idx];
            const dx = star.x - neighbor.x;
            const dy = star.y - neighbor.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = 1 - distance / maxDistance;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(neighbor.x, neighbor.y);
                ctx.stroke();
            }
        });
    });
}


drawStarfield();