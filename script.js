window.onload = function() {
    Particles.init({
        selector: '.background',
        maxParticles: 30, // Reducido el número de partículas
        connectParticles: true,
        speed: 2,
        minDistance: 100, // Ajustado para mayor dispersión
        sizeVariations: 3,
        color: '#ffffff'
    });

    // Detectar movimiento del mouse
    document.addEventListener('mousemove', function(event) {
        const particles = document.querySelectorAll('.background .particle');
        particles.forEach(particle => {
            const x = event.clientX + (Math.random() - 0.5) * 50; // Desplazamiento aleatorio
            const y = event.clientY + (Math.random() - 0.5) * 50; // Desplazamiento aleatorio
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}
