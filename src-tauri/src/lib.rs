use tauri::Emitter;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init()) // Plugin FS necessário para armazenamento
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::Manager;
                use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_shortcuts(["ctrl+d", "alt+space"])?
                        .with_handler(|app, shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                if shortcut.matches(Modifiers::CONTROL, Code::KeyD) {
                                    let _ = app.emit("shortcut-event", "Ctrl+D triggered");
                                    println!("Ctrl+D atalho ativado!");
                                }
                                if shortcut.matches(Modifiers::ALT, Code::Space) {
                                    let _ = app.emit("shortcut-event", "Alt+Space triggered");
                                    println!("Alt+Space atalho ativado!");
                                }
                            }
                        })
                        .build(),
                )?;
            }

            println!("Aplicação Tauri iniciada com sucesso!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
