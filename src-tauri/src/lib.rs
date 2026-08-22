// Ejemplo mínimo pero real de comando Tauri: Guard Clause + flujo de salida único
// (ver dbv-specs-ops/docs/MASTER_PROMPT.md, Estándares de Codificación §1). Devuelve datos, no una
// frase ya construida — la presentación (con i18n) vive en el frontend, no aquí.
#[tauri::command]
fn get_greeting_name(name: &str) -> String {
    name.trim().to_string()
}

#[tauri::command]
fn save_file_dialog(default_name: String, content: String) -> Result<bool, String> {
    if let Some(path) = rfd::FileDialog::new()
        .set_file_name(&default_name)
        .add_filter("Text files (*.txt, *.md)", &["txt", "md"])
        .save_file()
    {
        std::fs::write(&path, content).map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
fn open_file_dialog() -> Result<Option<(String, String)>, String> {
    if let Some(path) = rfd::FileDialog::new()
        .add_filter("Text files (*.txt, *.md)", &["txt", "md"])
        .pick_file()
    {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let name = path.file_stem().and_then(|s| s.to_str()).unwrap_or("").to_string();
        Ok(Some((name, content)))
    } else {
        Ok(None)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            #[cfg(target_os = "macos")]
            {
                let menu = tauri::menu::Menu::default(_app.handle())?;
                let _ = _app.set_menu(menu);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_greeting_name,
            save_file_dialog,
            open_file_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_surrounding_whitespace() {
        assert_eq!(get_greeting_name("  David  "), "David");
    }

    #[test]
    fn empty_input_returns_empty_string() {
        assert_eq!(get_greeting_name("   "), "");
    }
}
