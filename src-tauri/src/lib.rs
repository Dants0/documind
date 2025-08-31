use tauri::Emitter;

mod semantic_analysis;

use semantic_analysis::{SemanticAnalyzer, SemanticData};

#[tauri::command]
async fn analyze_document_semantics(content: String) -> Result<SemanticData, String> {
    let analyzer = SemanticAnalyzer::new();
    let analysis = analyzer.analyze_text(&content);
    Ok(analysis)
}

#[tauri::command]
async fn batch_analyze_semantics(documents: Vec<String>) -> Result<Vec<SemanticData>, String> {
    let analyzer = SemanticAnalyzer::new();
    let mut results = Vec::new();

    for content in documents {
        let analysis = analyzer.analyze_text(&content);
        results.push(analysis);
    }

    Ok(results)
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            analyze_document_semantics,
            batch_analyze_semantics
        ])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
