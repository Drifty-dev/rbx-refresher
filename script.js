window.onload = function() {
    Particles.init({
        selector: '.background',
        maxParticles: 30,
        connectParticles: true,
        speed: 2,
        minDistance: 100,
        sizeVariations: 3,
        color: '#ffffff'
    });

    // Detect mouse movement
    document.addEventListener('mousemove', function(event) {
        const particles = document.querySelectorAll('.background .particle');
        particles.forEach(particle => {
            // Get current particle position
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            // Calculate the opposite direction from the mouse
            const deltaX = particleX - event.clientX;
            const deltaY = particleY - event.clientY;

            // Calculate the distance from the mouse to the particle
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Only move the particle if it's close to the mouse
            if (distance < 100) { // Change this value for sensitivity
                // Normalize the direction vector to ensure uniform movement
                const normX = deltaX / distance;
                const normY = deltaY / distance;

                // Move the particle away from the mouse
                const moveDistance = (100 - distance) / 5; // Adjust adjust movement based on distance
                particle.style.transform = `translate(${(normX * moveDistance)}px, ${(normY * moveDistance)}px)`;
            } else {
                // Reset particle position back to original if far enough
                particle.style.transform = 'translate(0px, 0px)';
            }
        });
    });
}
