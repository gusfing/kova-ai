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

#[derive(serde::Serialize)]
struct CliStatus {
    opencode: bool,
    claude: bool,
    codex: bool,
    lmstudio: bool,
    ollama: bool,
    lmstudio_models: Vec<String>,
}

#[tauri::command]
async fn probe_all_clis() -> Result<CliStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        // 1. Check opencode
        let opencode = Command::new("powershell")
            .args(["-NoProfile", "-Command", "Get-Command opencode -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"])
            .output()
            .map(|o| !o.stdout.is_empty())
            .unwrap_or(false);

        // 2. Check claude
        let claude = Command::new("powershell")
            .args(["-NoProfile", "-Command", "Get-Command claude -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"])
            .output()
            .map(|o| !o.stdout.is_empty())
            .unwrap_or(false);

        // 3. Check codex
        let codex = Command::new("powershell")
            .args(["-NoProfile", "-Command", "Get-Command codex -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"])
            .output()
            .map(|o| !o.stdout.is_empty())
            .unwrap_or(false);

        // 4. Check LM Studio port 1234
        let mut lmstudio = false;
        let mut lmstudio_models = Vec::new();
        if let Ok(addr) = "127.0.0.1:1234".parse::<SocketAddr>() {
            if let Ok(mut stream) = TcpStream::connect_timeout(&addr, Duration::from_millis(600)) {
                lmstudio = true;
                let req = "GET /v1/models HTTP/1.1\r\nHost: 127.0.0.1:1234\r\nConnection: close\r\n\r\n";
                if stream.write_all(req.as_bytes()).is_ok() {
                    let mut resp = String::new();
                    let _ = stream.read_to_string(&mut resp);
                    if let Some(pos) = resp.find("\r\n\r\n") {
                        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&resp[pos + 4..]) {
                            if let Some(arr) = parsed.get("data").and_then(|d| d.as_array()) {
                                for item in arr {
                                    if let Some(id) = item.get("id").and_then(|i| i.as_str()) {
                                        if !id.contains("embed") {
                                            lmstudio_models.push(id.to_string());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 5. Check Ollama port 11434
        let ollama = if let Ok(addr) = "127.0.0.1:11434".parse::<SocketAddr>() {
            TcpStream::connect_timeout(&addr, Duration::from_millis(300)).is_ok()
        } else {
            false
        };

        Ok(CliStatus {
            opencode,
            claude,
            codex,
            lmstudio,
            ollama,
            lmstudio_models,
        })
    })
    .await
    .map_err(|e| format!("Probe error: {}", e))?
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

#[tauri::command]
async fn run_claude_cli(prompt: String, cwd: Option<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut cmd = Command::new("powershell");
        let escaped = prompt.replace('\'', "''");
        let script = format!("$null | claude -p '{}' --dangerously-skip-permissions", escaped);
        cmd.args(["-NoProfile", "-Command", &script]);
        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }
        match cmd.output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                if output.status.success() || !stdout.is_empty() {
                    Ok(stdout)
                } else {
                    Err(format!("Claude Code error: {}\n{}", stdout, stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute Claude Code CLI: {}", e)),
        }
    })
    .await
    .map_err(|e| format!("Async runtime error: {}", e))?
}

#[tauri::command]
async fn run_codex_cli(prompt: String, cwd: Option<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut cmd = Command::new("powershell");
        let escaped = prompt.replace('\'', "''");
        let script = format!("$null | codex exec --skip-git-repo-check --approve-for-me '{}'", escaped);
        cmd.args(["-NoProfile", "-Command", &script]);
        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }
        match cmd.output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                if output.status.success() || !stdout.is_empty() {
                    Ok(stdout)
                } else {
                    Err(format!("Codex CLI error: {}\n{}", stdout, stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute Codex CLI: {}", e)),
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
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            } else {
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
            probe_all_clis,
            query_lmstudio_models,
            send_lmstudio_chat,
            check_wp_status,
            run_opencode_agent,
            run_claude_cli,
            run_codex_cli
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
