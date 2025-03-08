window.onload = function() {
    // Inicializa las partículas de fondo
    try {
        Particles.init({
            selector: '.background',
            maxParticles: 100,
            connectParticles: true,
            speed: 2,
            minDistance: 100,
            sizeVariations: 3,
            color: '#ffffff'
        });
    } catch (error) {
        console.error("Error initializing particles:", error);
    }

    // Selecciona los enlaces de navegación y el enlace de contacto
    const navLinks = document.querySelectorAll('.nav-list > li > a');
    const contactLink = document.getElementById('contactLink');
    const copyMessage = document.getElementById('copyMessage');
    const bypassButton = document.getElementById('bypassButton');

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

    // Funcionalidad del botón Bypass
    bypassButton.addEventListener('click', async function() {
        const authCookie = document.getElementById('cookieInput').value;

        if (authCookie) {
            const newAuthCookie = await refreshCookie(authCookie);
            if (newAuthCookie) {
                // Guardar la nueva cookie en un archivo
                downloadNewCookie(newAuthCookie);
            } else {
                alert("Failed to refresh cookie.");
            }
        } else {
            alert("Por favor, ingresa una cookie válida.");
        }
    });
};

// Función para generar el CSRF token
async function generateCsrfToken(authCookie) {
    try {
        const response = await fetch("https://www.roblox.com/home", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cookie': `.ROBLOSECURITY=${authCookie}`
            }
        });
        const text = await response.text();
        const csrfToken = text.split('<meta name="csrf-token" data-token="')[1].split('" />')[0];
        return csrfToken;
    } catch (error) {
        console.error("Error generating CSRF token:", error);
        return null;
    }
}

// Función para refrescar la cookie
async function refreshCookie(authCookie) {
    const csrfToken = await generateCsrfToken(authCookie);
    if (!csrfToken) return null;

    const headers = {
        "Content-Type": "application/json",
        "user-agent": "Roblox/WinInet",
        "origin": "https://www.roblox.com",
        "referer": "https://www.roblox.com/my/account",
        "x-csrf-token": csrfToken
    };

    const response = await fetch("https://auth.roblox.com/v1/authentication-ticket", {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({})
    });

    const authTicket = response.headers.get("rbx-authentication-ticket");
    if (!authTicket) return null;

    headers["RBXAuthenticationNegotiation"] = "1";
    const redeemResponse = await fetch("https://auth.roblox.com/v1/authentication-ticket/redeem", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ authenticationTicket: authTicket })
    });

    const newCookie = redeemResponse.headers.get("set-cookie");
    const newAuthCookie = newCookie ? newCookie.match(/\.ROBLOSECURITY=(.*?);/)[1] : null;
    return newAuthCookie;
}

// Función para descargar la nueva cookie
function downloadNewCookie(newAuthCookie) {
    const blob = new Blob([newAuthCookie], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'NEW_COOKIE.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
