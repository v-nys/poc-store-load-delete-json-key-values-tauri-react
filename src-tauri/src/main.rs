// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

#[tauri::command]
fn read() -> Result<HashMap<String, String>, String> {
    let data_dir =
        tauri::api::path::data_dir().ok_or_else(|| "Unable to request data directory.")?;
    let collections_file = data_dir.join("lblpcollections.json");
    let collections_read_result = tauri::api::file::read_string(&collections_file);
    let collections_data = match collections_read_result {
        Ok(data) => data,
        Err(tauri::api::Error::Io(e)) if e.kind() == std::io::ErrorKind::NotFound => "{}".into(),
        Err(e) => Err(e.to_string())?,
    };
    let current_collections: HashMap<String, String> =
        serde_json::from_str(&collections_data).map_err(|e| e.to_string())?;
    Ok(current_collections)
}

#[tauri::command]
fn remove(name: &str) -> Result<HashMap<String, String>, String> {
    let data_dir =
        tauri::api::path::data_dir().ok_or_else(|| "Unable to request data directory.")?;
    let collections_file = data_dir.join("lblpcollections.json");
    let mut current_collections: HashMap<String, String> = read()?;
    current_collections.remove(name);
    let serialized = serde_json::to_string(&current_collections).map_err(|e| e.to_string())?;
    std::fs::write(collections_file, serialized).map_err(|e| e.to_string())?;
    Ok(current_collections)
}

#[tauri::command]
fn store(collection: &str, paths: &str) -> Result<HashMap<String, String>, String> {
    let data_dir =
        tauri::api::path::data_dir().ok_or_else(|| "Unable to request data directory.")?;
    let collections_file = data_dir.join("lblpcollections.json");
    let mut current_collections: HashMap<String, String> = read()?;
    current_collections.insert(collection.into(), paths.into());
    let serialized = serde_json::to_string(&current_collections).map_err(|e| e.to_string())?;
    std::fs::write(collections_file, serialized).map_err(|e| e.to_string())?;
    Ok(current_collections)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read, store, remove])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
