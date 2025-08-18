document.addEventListener("DOMContentLoaded", async () => {
// Elementos da UI
    const elements = {
        app: document.getElementById("app"),
        header: document.getElementById("header"),
        chatFrame: document.getElementById("chatFrame"),
        loadingOverlay: document.getElementById("loadingOverlay"),
        statusIndicator: document.getElementById("statusIndicator"),
        statusText: document.getElementById("statusText"),
        configPanel: document.getElementById("configPanel"),
        configBtn: document.getElementById("configBtn"),
        connectBtn: document.getElementById("connectBtn"),
        sessionIdInput: document.getElementById("sessionId"),
        pinBtn: document.getElementById("pinBtn"),
        transparentBtn: document.getElementById("transparentBtn"),
        closeBtn: document.getElementById("closeBtn"),
        minimizeBtn: document.getElementById("minimizeBtn"),
        beepToggle: document.getElementById("beep-toggle"),
        beepVolume: document.getElementById("beep-volume"),
        testBeepBtn: document.getElementById("testBeepBtn")
    };

       // Estado da aplicação
    const state = {
        sessionId: "M7CduGEicP",
        isConfigOpen: false,
        isTransparent: false,
        isPinned: false,
        isConnected: false,
         beepSettings: {
            enabled: true,
            volume: 100
        }
    };

      // Inicialização
    async function init() {
        elements.sessionIdInput.value = state.sessionId;
        document.body.classList.toggle("transparent", state.isTransparent);
        
        // Configurações iniciais do beep
        elements.beepToggle.checked = state.beepSettings.enabled;
        elements.beepVolume.value = state.beepSettings.volume;
        
        updateUI();
        setupEventListeners();
    }

        // Atualiza a UI
    function updateUI() {
        // Botões de toggle
        elements.transparentBtn.classList.toggle("active", state.isTransparent);
        elements.transparentBtn.querySelector(".btn-text").textContent = 
            state.isTransparent ? "Opaco" : "Transparente";
        
        elements.pinBtn.classList.toggle("active", state.isPinned);
        elements.pinBtn.querySelector(".btn-text").textContent = 
            state.isPinned ? "Fixado" : "Fixar";
        
        // Status de conexão
        elements.statusIndicator.classList.toggle("connected", state.isConnected);
        elements.statusText.textContent = state.isConnected ? "ON" : "OFF";
        elements.statusText.style.color = state.isConnected ? "#4CAF50" : "#F44336";
    }

      // Atualiza configurações do beep
    function updateBeepSettings() {
        state.beepSettings.enabled = elements.beepToggle.checked;
        state.beepSettings.volume = parseInt(elements.beepVolume.value) || 100;
        sendBeepSettings();
    }

    // Envia configurações do beep para o iframe
    function sendBeepSettings() {
        if (state.isConnected && elements.chatFrame.contentWindow) {
            elements.chatFrame.contentWindow.postMessage({
                type: "beepSettings",
                enabled: state.beepSettings.enabled,
                volume: state.beepSettings.volume
            }, "*");
        }
    }

    // Testa o beep
    function testBeep() {
        if (state.isConnected && elements.chatFrame.contentWindow) {
            try {
                elements.chatFrame.contentWindow.postMessage({
                    type: "testBeep"
                }, "*");
            } catch (error) {
                console.error("Erro ao testar beep:", error);
                showToast("Erro ao testar beep. Verifique a conexão.");
            }
        } else {
            showToast("Conecte-se ao chat primeiro");
        }
    }
     // Conecta ao chat
    async function connectToChat() {
        state.sessionId = elements.sessionIdInput.value.trim();
        
        if (!state.sessionId) {
            showToast("Digite um Session ID válido!");
            return;
        }

        elements.loadingOverlay.classList.remove("hidden");
        state.isConnected = false;
        updateUI();

        try {
            const chatUrl = `src/assets/chat/custom-theme.html?session=${encodeURIComponent(state.sessionId)}`;
            elements.chatFrame.src = chatUrl;

            await new Promise((resolve) => {
                elements.chatFrame.onload = () => {
                    setTimeout(() => {
                        elements.loadingOverlay.classList.add("hidden");
                        state.isConnected = true;
                        sendBeepSettings(); // Envia configurações ao conectar
                        updateUI();
                        showToast("Conectado com sucesso!");
                        resolve();
                    }, 800);
                };
            });
        } catch (error) {
            console.error("Erro ao conectar:", error);
            elements.loadingOverlay.classList.add("hidden");
            showToast("Falha na conexão!");
        }
    }

     // Alterna estado de fixação da janela
    async function toggleWindowPin() {
        try {
            state.isPinned = !state.isPinned;
            await window.go.main.App.SetAlwaysOnTop(state.isPinned);
            updateUI();
            showToast(state.isPinned ? "Janela fixada" : "Janela liberada");
        } catch (error) {
            console.error("Erro ao fixar janela:", error);
            state.isPinned = !state.isPinned;
            showToast("Erro ao alterar fixação");
        }
    }

    // Alterna transparência da janela
    async function toggleTransparency() {
        try {
            state.isTransparent = !state.isTransparent;
            document.body.classList.toggle("transparent", state.isTransparent);
            updateUI();
            showToast(state.isTransparent ? "Modo transparente" : "Modo opaco");
        } catch (error) {
            console.error("Erro ao alterar transparência:", error);
            state.isTransparent = !state.isTransparent;
            showToast("Erro ao alterar transparência");
        }
    }


     // Mostra notificação toast
    function showToast(message, duration = 3000) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }, 10);
    }

    // Inicializa a aplicação
    await init();
});