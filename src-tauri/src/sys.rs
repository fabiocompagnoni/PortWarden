use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PortInfo {
    pub port: u16,
    pub pid: Option<i32>,
    pub process_name: Option<String>,
    pub protocol: String,
}

pub fn get_active_ports() -> Vec<PortInfo> {
    let mut ports = Vec::new();

    // Get socket inode to PID mapping
    let inode_to_pid = get_inode_to_pid();

    // TCP
    if let Ok(tcp) = procfs::net::tcp() {
        for entry in tcp {
            let port = entry.local_address.port();
            let inode = entry.inode;
            let info = inode_to_pid.get(&inode);

            ports.push(PortInfo {
                port,
                pid: info.map(|(pid, _)| *pid),
                process_name: info.map(|(_, name)| name.clone()),
                protocol: "TCP".to_string(),
            });
        }
    }

    // UDP
    if let Ok(udp) = procfs::net::udp() {
        for entry in udp {
            let port = entry.local_address.port();
            let inode = entry.inode;
            let info = inode_to_pid.get(&inode);

            ports.push(PortInfo {
                port,
                pid: info.map(|(pid, _)| *pid),
                process_name: info.map(|(_, name)| name.clone()),
                protocol: "UDP".to_string(),
            });
        }
    }

    ports
}

fn get_inode_to_pid() -> HashMap<u64, (i32, String)> {
    let mut map = HashMap::new();

    if let Ok(all_procs) = procfs::process::all_processes() {
        for proc in all_procs {
            if let Ok(proc) = proc {
                let pid = proc.pid;
                let name = proc
                    .stat()
                    .ok()
                    .map(|s| s.comm)
                    .unwrap_or_else(|| "unknown".to_string());

                if let Ok(fds) = proc.fd() {
                    for fd in fds {
                        if let Ok(fd) = fd {
                            if let procfs::process::FDTarget::Socket(inode) = fd.target {
                                map.insert(inode, (pid, name.clone()));
                            }
                        }
                    }
                }
            }
        }
    }

    map
}

pub fn kill_process(pid: i32) -> Result<(), String> {
    use sysinfo::{Pid, System};

    let s = System::new_all();
    if let Some(process) = s.process(Pid::from(pid as usize)) {
        if process.kill() {
            Ok(())
        } else {
            Err("Failed to kill process".to_string())
        }
    } else {
        Err("Process not found".to_string())
    }
}
