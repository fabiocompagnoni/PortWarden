use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ForwardRule {
    pub id: String,
    pub local_port: u16,
    pub remote_address: String,
    pub active: bool,
}

pub struct Forwarder {
    handles: Arc<Mutex<HashMap<String, tokio::task::JoinHandle<()>>>>,
}

impl Forwarder {
    pub fn new() -> Self {
        Self {
            handles: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn start(&self, rule: ForwardRule) -> Result<(), String> {
        let mut handles = self.handles.lock().await;
        if handles.contains_key(&rule.id) {
            return Err("Rule already active".to_string());
        }

        let local_port = rule.local_port;
        
        // Bind early to ensure port is available
        let listener = TcpListener::bind(format!("0.0.0.0:{}", local_port))
            .await
            .map_err(|e| format!("Failed to bind to port {}: {}. Port might be in use.", local_port, e))?;

        let remote_address = rule.remote_address.clone();
        
        let handle = tokio::spawn(async move {
            loop {
                match listener.accept().await {
                    Ok((mut client, _)) => {
                        let remote_addr = remote_address.clone();
                        tokio::spawn(async move {
                            match TcpStream::connect(remote_addr).await {
                                Ok(mut remote) => {
                                    let _ = tokio::io::copy_bidirectional(&mut client, &mut remote).await;
                                }
                                Err(e) => eprintln!("Failed to connect to remote: {}", e),
                            }
                        });
                    }
                    Err(e) => eprintln!("Accept failed: {}", e),
                }
            }
        });

        handles.insert(rule.id, handle);
        Ok(())
    }

    pub async fn stop(&self, id: &str) {
        let mut handles = self.handles.lock().await;
        if let Some(handle) = handles.remove(id) {
            handle.abort();
        }
    }
}
