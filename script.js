window.onload = function() {
    // Inicializa las partículas de fondo
    Particles.init({
        selector: '.background',
        maxParticles: 100,
        connectParticles: true,
        speed: 2,
        minDistance: 100,
        sizeVariations: 3,
        color: '#ffffff'
    });

    // Selecciona los enlaces de navegación y el enlace de contacto
    const navLinks = document.querySelectorAll('.nav-list > li > a');
    const contactLink = document.getElementById('contactLink');
    const copyMessage = document.getElementById('copyMessage');

    // Agrega un evento de clic a cada enlace de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Elimina la clase 'active' de todos los enlaces
            navLinks.forEach(item => item.classList.remove('active'));
            // Agrega la clase 'active' al enlace clicado
            this.classList.add('active');
            
            // Si el enlace clicado es el de contacto
            if (this === contactLink) {
                // Crea un elemento de texto temporal
                const tempInput = document.createElement('input');
                tempInput.value = 'rbx-tools@gmail.com';
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy'); // Copia el texto al portapapeles
                document.body.removeChild(tempInput); // Elimina el elemento temporal

                // Muestra el mensaje "Copied!"
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.opacity = '1'; // Aparece el mensaje
                }, 10); // Permite que la propiedad display: block surta efecto
                
                setTimeout(() => {
                    copyMessage.style.opacity = '0'; // Desaparece el mensaje
                }, 2000); // Muestra durante 2 segundos
                
                setTimeout(() => {
                    copyMessage.style.display = 'none'; // Oculta después de la animación
                }, 2500); // Oculta después de que la animación se complete
            }
        });
    });
};
