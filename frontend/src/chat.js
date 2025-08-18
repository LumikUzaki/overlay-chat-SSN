// Configurações
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.has("session") ? urlParams.get("session") : "iWWnKL28tQ";
const password = "false";
const MAX_MESSAGES = urlParams.has("limit") ? parseInt(urlParams.get("limit")) : 20;
const MAX_SPACER_HEIGHT = 18000000;
const messageTimestamps = new Map();

// Elementos DOM
const chatContainer = document.getElementById('chat-container');
const messageListWrapper = document.getElementById('message-list-wrapper');
const topSpacer = document.getElementById('spacer');
const beep = new Audio('beep.mp3'); // Cria elemento de áudio programaticamente


// Configuração inicial do beep
beep.volume = 1;
beep.preload = 'auto';
let beepEnabled = true;
let connectionToastShown = false;

// Função para mostrar toast (adicionar no chat.js)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1000;
        animation: fadeInOut 2.5s ease-in-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2500);
}



// Função para ajustar o scroll
function adjustMessageWrapperScroll() {
    requestAnimationFrame(() => {
        const wrapperHeight = messageListWrapper.scrollHeight;
        const containerHeight = chatContainer.clientHeight;
        const translateY = wrapperHeight > containerHeight ? 
            -(wrapperHeight - containerHeight) : 0;
        messageListWrapper.style.transform = `translateY(${translateY}px)`;
    });
}

// Configura listener para mensagens de controle do beep
window.addEventListener("message", (event) => {
    if (event.data.type === "beepSettings") {
        beepEnabled = event.data.enabled;
        beep.volume = Math.min(Math.max(event.data.volume / 100, 0), 1);
    }
});

// Função para tocar beep quando habilitado
function playBeepIfEnabled() {
    if (beepEnabled) {
        beep.currentTime = 0;
        beep.play().catch(err => console.warn("Erro ao tocar beep:", err));
    }
}

// Função para adicionar mensagem
function addMessageToOverlay(data) {
    if (!data.chatname && !data.chatmessage && !data.hasDonation && !data.donation && !data.contentimg) return;
    
    const messageId = data.mid || 'msg-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.classList.add('message');
    messageTimestamps.set(messageId, Date.now());

    // Badges
    let chatbadgesHtml = "";
    if (data.chatbadges) {
        data.chatbadges.forEach(badge => {
            chatbadgesHtml += typeof badge === "object" ? 
                (badge.type === "img" && badge.src ? `<img class='badge' src='${badge.src}' alt='badge'>` : 
                badge.type === "svg" && badge.html ? `<span class='badge svg'>${badge.html}</span>` : '') : 
                `<img class='badge' src='${badge}' alt='badge'>`;
        });
    }

    // Elementos da mensagem
    const sourceIconHtml = data.type ? 
        `<img src="https://socialstream.ninja/sources/images/${data.type}.png" alt="Source" class="source-icon">` : '';
    
    const avatarHtml = data.chatimg ? 
        `<div class="avatar-wrapper"><div class="avatar" style="background-image: url('${data.chatimg}');"></div></div>` : '';
    
    const nameHtml = data.chatname ? 
        `<div class="name-bg"><span class="name">${data.chatname}</span>${sourceIconHtml}${chatbadgesHtml}</div>` : '';
    
    const messageTextHtml = data.chatmessage ? 
        `<div class="text">${data.chatmessage}</div>` : '';
    
    const donationHtml = data.hasDonation ? 
        `<div class="donation">${data.hasDonation}</div>` : '';

    // Montagem da mensagem
    messageDiv.innerHTML = `
        <div class="message-content-wrapper">
            ${avatarHtml}
            <div class="message-text-meta">
                ${nameHtml}
                ${messageTextHtml}
                ${donationHtml}
            </div>
        </div>
    `;

    // Adiciona e anima a mensagem
    messageListWrapper.appendChild(messageDiv);
    setTimeout(() => messageDiv.classList.add('visible'), 10);
    
    // Toca o beep para nova mensagem
    playBeepIfEnabled();
    
    // Remove mensagens antigas
    const messages = Array.from(messageListWrapper.children)
        .filter(child => child.id !== 'spacer' && child.classList.contains('message'));
    
    if (messages.length > MAX_MESSAGES) {
        const oldest = messages[0];
        const spacerHeight = parseFloat(topSpacer.style.height) || 0;
        const newHeight = spacerHeight + oldest.offsetHeight + 15; // + margin
        
        topSpacer.style.height = newHeight > MAX_SPACER_HEIGHT ? '0px' : `${newHeight}px`;
        messageTimestamps.delete(oldest.id);
        oldest.remove();
    }
    
    adjustMessageWrapperScroll();
}

// Configuração do WebSocket/iframe
var iframe = document.createElement("iframe");
iframe.src = `https://vdo.socialstream.ninja/?ln&salt=vdo.ninja&password=${password}&push&label=dock&vd=0&ad=0&novideo&noaudio&autostart&cleanoutput&room=${roomID}`;
iframe.style.cssText = "width: 0px; height: 0px; position: fixed; left: -100px; top: -100px;";
document.body.appendChild(iframe);

// Listener para mensagens do chat
window.addEventListener("message", function(e) {
    if (e.source === iframe.contentWindow && e.data.dataReceived?.overlayNinja) {
        addMessageToOverlay(e.data.dataReceived.overlayNinja);
          showToast("Chat conectado com sucesso!");
            lastConnectionId = e.data.connectionId;

         
    }// Para status de conexão (apenas uma vez)
    if (e.data.type === "connectionStatus" && e.data.connected && !connectionToastShown) {
        showToast("Chat conectado com sucesso!");
        connectionToastShown = true;
        
        // Reset após 5 minutos (opcional)
        setTimeout(() => {
            connectionToastShown = false;
        }, 3000000);
    }
});

// Limpeza de mensagens antigas
setInterval(() => {
    const now = Date.now();
    Array.from(messageListWrapper.children)
        .filter(child => child.id !== 'spacer' && child.classList.contains('message'))
        .forEach(msg => {
            const timestamp = messageTimestamps.get(msg.id);
            if (timestamp && now - timestamp > 50000 && !msg.classList.contains('fading')) {
                msg.classList.add('fading');
            }
        });
}, 1000);

// Função para teste do beep (pode ser chamada pelo painel de controle)
window.testBeep = function() {
    playBeepIfEnabled();
};