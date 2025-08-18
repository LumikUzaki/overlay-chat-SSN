package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:             "StreamChat Overlay",
		Width:             400,
		Height:            600,
		Frameless:         false, // ✅ Janela sem bordas
		HideWindowOnClose: false,

		AssetServer: &assetserver.Options{
			Assets: assets,
		},

		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0}, // ✅ Fundo transparente
		Windows: &windows.Options{
			WebviewIsTransparent: false, // ✅ Webview transparente
			WindowIsTranslucent:  true,  // ✅ Janela translúcida
			DisableWindowIcon:    false,
		},
		Bind: []interface{}{
			app, // ✅ Expõe o backend ao frontend
		},
		OnStartup:  app.startup,
		OnDomReady: app.domReady,
		OnShutdown: app.shutdown,
	})

	if err != nil {
		log.Fatal("Erro ao iniciar aplicação:", err)
	}

}
