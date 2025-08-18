package main

import (
	"context"
	"log"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	log.Println("Aplicação iniciada")
}

func (a *App) domReady(ctx context.Context) {
	log.Println("DOM pronto")
}

func (a *App) shutdown(ctx context.Context) {
	log.Println("Aplicação encerrada")
}

// SetAlwaysOnTop controla se a janela fica sempre no topo
func (a *App) SetAlwaysOnTop(state bool) error {
	runtime.WindowSetAlwaysOnTop(a.ctx, state)
	log.Printf("AlwaysOnTop alterado para: %v", state)
	return nil
}

// SetWindowTransparent controla a transparência da janela
func (a *App) SetWindowTransparent(transparent bool) error {
	// Note: Esta função requer configuração adicional no Wails
	log.Printf("Transparência alterada para: %v", transparent)
	return nil
}

// Função para fechar completamente o aplicativo
func (a *App) Quit() {
	runtime.Quit(a.ctx)

	log.Printf("quit alterado para: ")

}
