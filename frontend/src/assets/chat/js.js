


















// Atualize o listener de mensagens para incluir o testBeep
window.addEventListener("message", (event) => {
    if (event.data.type === "beepSettings") {
        currentBeepSettings.enabled = event.data.enabled;
        currentBeepSettings.volume = Math.min(Math.max(event.data.volume / 100, 0), 1);
        beep.volume = currentBeepSettings.volume;
    }
    
    // Adicione esta parte para responder ao teste de beep
    if (event.data.type === "testBeep") {
        playBeepIfEnabled();
    }
});

// Melhore a função playBeepIfEnabled para usar as configurações atuais
function playBeepIfEnabled() {
    if (currentBeepSettings.enabled) {
        beep.volume = currentBeepSettings.volume;
        beep.currentTime = 0;
        beep.play().catch(err => console.warn("Erro ao tocar beep:", err));
    }
}

// Adicione esta função para expor as configurações atuais (opcional)
window.getBeepSettings = function() {
    return currentBeepSettings;
};

// Adicione tratamento de erro para o áudio
beep.addEventListener('error', (e) => {
    console.error("Erro no áudio do beep:", e);
    // Tenta carregar novamente se houver erro
    beep.load();
});