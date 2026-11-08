use std::fs;
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;
use tauri::Manager;

#[tauri::command]
fn read_file_content(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path).map_err(|e| format!("Failed to read {}: {}", file_path, e))
}

#[tauri::command]
fn write_file_content(file_path: String, content: String) -> Result<bool, String> {
    let p = Path::new(&file_path);
    if let Some(parent) = p.parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(&file_path, content)
        .map(|_| true)
        .map_err(|e| format!("Failed to write {}: {}", file_path, e))
}

#[tauri::command]
fn list_dir_files(dir_path: String) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    let root = PathBuf::from(&dir_path);
    if !root.exists() {
        return Ok(results);
    }
    
    fn visit_dirs(dir: &Path, results: &mut Vec<String>, root: &Path) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
                if file_name == "node_modules" || file_name == ".git" || file_name == ".next" || file_name == "dist" || file_name == "vendor" {
                    continue;
                }
                if path.is_dir() {
                    visit_dirs(&path, results, root);
                } else if let Ok(rel) = path.strip_prefix(root) {
                    results.push(rel.to_string_lossy().replace('\\', "/"));
                }
            }
        }
    }

    visit_dirs(&root, &mut results, &root);
    results.sort();
    Ok(results)
}

#[tauri::command]
fn execute_command(cmd: String, cwd: Option<String>) -> Result<String, String> {
    let mut command = Command::new("powershell");
    command.args(["-NoProfile", "-Command", &cmd]);
    if let Some(dir) = cwd {
        command.current_dir(dir);
    }
    match command.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            if output.status.success() {
                Ok(stdout)
            } else {
                Err(format!("Error (code {:?}): {}\n{}", output.status.code(), stdout, stderr))
            }
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

#[tauri::command]
fn query_lmstudio_models() -> Result<String, String> {
    let addr: SocketAddr = "127.0.0.1:1234".parse().map_err(|e| format!("{}", e))?;
    let mut stream = TcpStream::connect_timeout(&addr, Duration::from_secs(2))
        .map_err(|e| format!("LM Studio not reachable on 127.0.0.1:1234: {}", e))?;
    
    stream.set_read_timeout(Some(Duration::from_secs(3))).map_err(|e| format!("{}", e))?;
    stream.set_write_timeout(Some(Duration::from_secs(3))).map_err(|e| format!("{}", e))?;

    let req = "GET /v1/models HTTP/1.1\r\nHost: 127.0.0.1:1234\r\nConnection: close\r\n\r\n";
    stream.write_all(req.as_bytes()).map_err(|e| format!("{}", e))?;

    let mut response = String::new();
    stream.read_to_string(&mut response).map_err(|e| format!("{}", e))?;

    if let Some(pos) = response.find("\r\n\r\n") {
        Ok(response[pos + 4..].to_string())
    } else {
        Ok(response)
    }
}

#[tauri::command]
async fn send_lmstudio_chat(payload: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let addr: SocketAddr = "127.0.0.1:1234".parse().map_err(|e| format!("{}", e))?;
        let mut stream = TcpStream::connect_timeout(&addr, Duration::from_secs(3))
            .map_err(|e| format!("Failed to connect to LM Studio: {}", e))?;

        stream.set_read_timeout(Some(Duration::from_secs(180))).map_err(|e| format!("{}", e))?;
        stream.set_write_timeout(Some(Duration::from_secs(10))).map_err(|e| format!("{}", e))?;

        let req = format!(
            "POST /v1/chat/completions HTTP/1.1\r\nHost: 127.0.0.1:1234\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            payload.as_bytes().len(),
            payload
        );
        stream.write_all(req.as_bytes()).map_err(|e| format!("{}", e))?;

        let mut response = Vec::new();
        stream.read_to_end(&mut response).map_err(|e| format!("{}", e))?;
        let resp_str = String::from_utf8_lossy(&response).to_string();

        if let Some(pos) = resp_str.find("\r\n\r\n") {
            Ok(resp_str[pos + 4..].to_string())
        } else {
            Ok(resp_str)
        }
    })
    .await
    .map_err(|e| format!("Async runtime error: {}", e))?
}

#[tauri::command]
fn check_wp_status() -> Result<bool, String> {
    let addr: SocketAddr = "127.0.0.1:8000".parse().map_err(|e| format!("{}", e))?;
    match TcpStream::connect_timeout(&addr, Duration::from_millis(500)) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn run_opencode_agent(prompt: String, model: Option<String>, cwd: Option<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut cmd = Command::new("powershell");
        let model_flag = match model {
            Some(ref m) if !m.is_empty() => format!("-m {}", m),
            _ => "-m opencode/deepseek-v4.1-flash-free".to_string(),
        };
        let dir_flag = match cwd {
            Some(ref d) if !d.is_empty() => format!("--dir '{}'", d),
            _ => "".to_string(),
        };
        let escaped_prompt = prompt.replace('\'', "''");
        let script = format!(
            "$null | & 'C:\\Users\\ks209\\AppData\\Roaming\\npm\\opencode.cmd' run --format json --thinking --auto {} {} '{}'",
            model_flag,
            dir_flag,
            escaped_prompt
        );
        cmd.args(["-NoProfile", "-Command", &script]);
        match cmd.output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                if !stdout.is_empty() {
                    Ok(stdout)
                } else if output.status.success() {
                    Ok(stdout)
                } else {
                    Err(format!("OpenCode error: {}\n{}", stdout, stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute opencode: {}", e)),
        }
    })
    .await
    .map_err(|e| format!("Async runtime error: {}", e))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            println!(">>> Tauri setup hook reached!");
            if let Some(w) = app.get_webview_window("main") {
                println!(">>> Webview 'main' found! Forcing show & focus...");
                let _ = w.show();
                let _ = w.set_focus();
            } else {
                println!(">>> Webview 'main' not auto-created, creating programmatically...");
                let _ = tauri::WebviewWindowBuilder::new(
                    app,
                    "main",
                    tauri::WebviewUrl::default()
                )
                .title("Kova AI Studio — Autonomous Website Builder")
                .inner_size(1440.0, 900.0)
                .min_inner_size(1024.0, 680.0)
                .center()
                .visible(true)
                .build();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file_content,
            write_file_content,
            list_dir_files,
            execute_command,
            query_lmstudio_models,
            send_lmstudio_chat,
            check_wp_status,
            run_opencode_agent
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
