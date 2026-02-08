// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sys;
mod net;

use sys::PortInfo;
use net::{ForwardRule, Forwarder};
use std::sync::Arc;
use tauri::{State, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tokio::sync::Mutex;

struct AppState {
    forwarder: Arc<Forwarder>,
    rules: Mutex<Vec<ForwardRule>>,
}

#[tauri::command]
fn get_active_ports() -> Vec<PortInfo> {
    sys::get_active_ports()
}

#[tauri::command]
async fn start_forward(rule: ForwardRule, state: State<'_, AppState>) -> Result<(), String> {
    state.forwarder.start(rule.clone()).await?;
    let mut rules = state.rules.lock().await;
    rules.push(rule);
    Ok(())
}

#[tauri::command]
async fn stop_forward(id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.forwarder.stop(&id).await;
    let mut rules = state.rules.lock().await;
    if let Some(rule) = rules.iter_mut().find(|r| r.id == id) {
        rule.active = false;
    }
    rules.retain(|r| r.id != id);
    Ok(())
}

#[tauri::command]
async fn get_forward_rules(state: State<'_, AppState>) -> Result<Vec<ForwardRule>, String> {
    let rules = state.rules.lock().await;
    Ok(rules.clone())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app: &tauri::AppHandle, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .manage(AppState {
            forwarder: Arc::new(Forwarder::new()),
            rules: Mutex::new(Vec::new()),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_active_ports,
            start_forward,
            stop_forward,
            get_forward_rules
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
