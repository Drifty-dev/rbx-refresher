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
    bypassButton.addEventListener('click', function() {
        const authCookie = document.getElementById('cookieInput').value;

        if (authCookie) {
            refreshCookie(authCookie);
        } else {
            alert("Por favor, ingresa una cookie válida.");
        }
    });
};

async function refreshCookie(authCookie) { 
    try { 
        // Paso 1: Generar CSRF Token 
        const csrfToken = await generateCsrfToken(authCookie); 
        if (!csrfToken) { 
            alert("Failed to generate CSRF token."); 
            return; 
        }

        // Paso 3: Solicitar el Ticket de Autenticación
        const authTicketResponse = await fetch("https://auth.roblox.com/v1/authentication-ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `.ROBLOSECURITY=${authCookie}`,
                "X-CSRF-Token": csrfToken
            },
            credentials: "include",
            body: JSON.stringify({})
        });

        const authTicket = authTicketResponse.headers.get("rbx-authentication-ticket");
        if (!authTicket) {
            alert("Failed to get authentication ticket.");
            return;
        }

        // Paso 4: Redimir el Ticket de Autenticación
        const redeemResponse = await fetch("https://auth.roblox.com/v1/authentication-ticket/redeem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `.ROBLOSECURITY=${authCookie}`,
                "X-CSRF-Token": csrfToken,
                "RBXAuthenticationNegotiation": "1"
            },
            body: JSON.stringify({ authenticationTicket: authTicket })
        });

        const newCookie = extractNewCookie(redeemResponse.headers.get("set-cookie"));
        if (newCookie) {
            saveCookieToFile(newCookie); // Llama a la función para guardar la cookie en un archivo
        } else {
            alert("Failed to extract new cookie.");
        }
    } catch (error) {
        console.error("Error refreshing cookie:", error);
        alert("An error occurred while refreshing the cookie.");
    }
}

async function generateCsrfToken(authCookie) { 
    try { 
        const response = await fetch("https://www.roblox.com/home", { 
            method: "GET", 
            credentials: "include", 
            headers: { "Cookie": `.ROBLOSECURITY=${authCookie}` }, 
            mode: 'no-cors' 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text(); 
        const csrfToken = text.split('<meta name="csrf-token" data-token="')[1].split('" />')[0];
        return csrfToken;
    } catch (error) {
        console.error("Error generating CSRF token:", error);
        alert("Error generating CSRF token: " + error.message);
        return null;
    }
}

function saveCookieToFile(cookie) {
    const blob = new Blob([cookie], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cookie.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
