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
            // Obtener la posición actual de la partícula
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            // Calcular la dirección opuesta al mouse
            const deltaX = particleX - event.clientX;
            const deltaY = particleY - event.clientY;

            // Calcular la distancia
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Normalizar la dirección
            const normX = deltaX / distance;
            const normY = deltaY / distance;

            // Mover la partícula en la dirección opuesta al mouse
            const moveDistance = 2; // Ajusta la velocidad de alejamiento
            particle.style.transform = `translate(${(normX * moveDistance)}px, ${(normY * moveDistance)}px)`;
        });
    });
}
