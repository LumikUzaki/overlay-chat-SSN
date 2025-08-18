document.addEventListener("DOMContentLoaded", async () => {
    // UI Elements
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
      
    };

    // App State
    const state = {
        sessionId: "id",
        isConfigOpen: false,
        isTransparent: false,
        isPinned: false,
        isConnected: false,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        beepSettings: {
            enabled: false,
            volume: 20
        }
    };

    // Initialize App
    async function init() {
        elements.sessionIdInput.value = state.sessionId;
        document.body.classList.toggle("transparent", state.isTransparent);
        
        elements.beepToggle.checked = state.beepSettings.enabled;
        elements.beepVolume.value = state.beepSettings.volume;
        
        updateUI();
        setupEventListeners();
    }

    // Update UI
    function updateUI() {
        // Toggle buttons
        elements.transparentBtn.classList.toggle("active", state.isTransparent);
        elements.transparentBtn.querySelector(".btn-text").textContent = 
            state.isTransparent ? "Opaco" : "Transparente";
        
        elements.pinBtn.classList.toggle("active", state.isPinned);
        elements.pinBtn.querySelector(".btn-text").textContent = 
            state.isPinned ? "Fixado" : "Fixar";
        
        // Update status
        elements.statusIndicator.classList.toggle("connected", state.isConnected);
        elements.statusText.textContent = state.isConnected ? "ON" : "OFF";
        elements.statusText.style.color = state.isConnected ? "#4CAF50" : "#F44336";
    }

    // Event Listeners
    function setupEventListeners() {
        // Basic controls
        elements.configBtn.addEventListener("click", toggleConfigPanel);
        elements.connectBtn.addEventListener("click", connectToChat);
        elements.sessionIdInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") connectToChat();
        });
        elements.pinBtn.addEventListener("click", toggleWindowPin);
        elements.transparentBtn.addEventListener("click", toggleTransparency);
        
        // Window controls
       elements.closeBtn.addEventListener("click", quitApp);
      
        
        // Beep controls
        elements.beepToggle.addEventListener("change", updateBeepSettings);
        elements.beepVolume.addEventListener("input", updateBeepSettings);
       
        
  
    }

 

    // Window Operations
            async function quitApp() {
                try {
                    await window.go.main.App.Quit();
                } catch (error) {
                    console.error("Erro ao fechar aplicativo:", error);
                    // Fallback para desenvolvimento
                    window.close();
                }
            }

    async function minimizeWindow() {
        try {
            await window.go.main.App.MinimizeWindow();
        } catch (error) {
            console.error("Error minimizing window:", error);
            showToast("Erro ao minimizar janela");
        }
    }

    async function toggleWindowPin() {
        try {
            state.isPinned = !state.isPinned;
            await window.go.main.App.SetAlwaysOnTop(state.isPinned);
            updateUI();
            showToast(state.isPinned ? "Janela fixada" : "Janela liberada");
        } catch (error) {
            console.error("Error toggling pin:", error);
            state.isPinned = !state.isPinned;
            showToast("Erro ao alternar fixação");
        }
    }

    async function toggleTransparency() {
        try {
            state.isTransparent = !state.isTransparent;
            document.body.classList.toggle("transparent", state.isTransparent);
            updateUI();
            showToast(state.isTransparent ? "Modo transparente" : "Modo opaco");
        } catch (error) {
            console.error("Error toggling transparency:", error);
            state.isTransparent = !state.isTransparent;
            showToast("Erro ao alternar transparência");
        }
    }

    // Chat Connection
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
            const chatUrl = `src/custom-theme.html?session=${encodeURIComponent(state.sessionId)}`;
            elements.chatFrame.src = chatUrl;

            await new Promise((resolve) => {
                elements.chatFrame.onload = () => {

                         // Envia mensagem para o iframe avisando que está conectado
                elements.chatFrame.contentWindow.postMessage({
                    type: "connectionStatus",
                    connected: true
                    
                }, "*");

                    setTimeout(() => {
                        elements.loadingOverlay.classList.add("hidden");
                        state.isConnected = true;
                        sendBeepSettings();
                        updateUI();
                        showToast("Conectado com sucesso!");
                        resolve();
                    }, 800);
                };
            });
        } catch (error) {
            console.error("Connection error:", error);
            elements.loadingOverlay.classList.add("hidden");
            showToast("Falha na conexão!");
        }
    }

    // Beep Controls
    function updateBeepSettings() {
        state.beepSettings.enabled = elements.beepToggle.checked;
        state.beepSettings.volume = parseInt(elements.beepVolume.value) || 100;
        sendBeepSettings();
    }

    function sendBeepSettings() {
        if (state.isConnected && elements.chatFrame.contentWindow) {
            elements.chatFrame.contentWindow.postMessage({
                type: "beepSettings",
                enabled: state.beepSettings.enabled,
                volume: state.beepSettings.volume
            }, "*");
        }
    }

    function testBeep() {
        if (state.isConnected && elements.chatFrame.contentWindow) {
            elements.chatFrame.contentWindow.postMessage({
                type: "testBeep"
            }, "*");
        } else {
            showToast("Conecte-se ao chat primeiro");
        }
    }

    // Config Panel
    function toggleConfigPanel() {
        state.isConfigOpen = !state.isConfigOpen;
        elements.configPanel.classList.toggle("open", state.isConfigOpen);
        elements.configBtn.classList.toggle("active", state.isConfigOpen);
        elements.configPanel.setAttribute("aria-hidden", !state.isConfigOpen);
    }

    // Toast Notifications
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

    // Initialize
    await init();

    

});