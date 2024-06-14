// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path, PathBuf};
use async_zip::base::read::seek::ZipFileReader;
use tokio::{
    fs::{create_dir_all, File, OpenOptions},
    io::BufReader,
};
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};
use reqwest;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use std::time::Instant;
use futures_lite::StreamExt;
use tokio::io::AsyncWriteExt;
use std::cmp::min;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Progress {
    pub download_id: String,
    pub filesize: u64,
    pub transfered: u64,
    pub transfer_rate: f64,
    pub percentage: f64,
}

impl Progress {
    pub fn emit_progress(&self, handle: &AppHandle) {
        handle.emit_all("rom://download:progress", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("rom://download:complete", &self).ok();
    }
}

/// Returns a relative path without reserved names, redundant separators, ".", or "..".
fn sanitize_file_path(path: &str) -> PathBuf {
    // Replaces backwards slashes
    path.replace('\\', "/")
        // Sanitizes each component
        .split('/')
        .map(sanitize_filename::sanitize)
        .collect()
}

const UPDATE_SPEED: u128 = 500;

pub async fn start_download(url: String, directory: String, filename: String, id: String, handle: AppHandle) {
    let res = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .or(Err(format!("Failed to GET from '{}'", &url)))
        .expect(&format!("Failed to GET from '{}'", &url));

    let filepath = Path::new(&directory).join(filename);
    let mut file = File::create(&filepath).await.or({
        Err("Error while creating the file")
    }).expect("File creation failed.");

    let start = Instant::now();
    let mut last_update = Instant::now();

    let mut downloaded_bytes: u64 = 0;
    let filesize = res.content_length().expect("Failed to retrieve content length");
    let mut stream = res.bytes_stream();

    

    let mut progress = Progress {
        download_id: id,
        filesize: filesize,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    tokio::spawn(async move {
        while let Some(item) = stream.next().await {
            let chunk = match item {
                Ok(chunk) => chunk,
                Err(_) => {
                    println!("Error while downloading file");
                    break;
                }
            };

            file.write_all(&chunk).await.expect("Write operation failed.");

            downloaded_bytes = min(downloaded_bytes + (chunk.len() as u64), filesize);

            progress.transfered = downloaded_bytes;
            progress.percentage = (progress.transfered * 100 / filesize) as f64;
            progress.transfer_rate = (downloaded_bytes as f64) / (start.elapsed().as_secs() as f64)
                + (start.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

            if last_update.elapsed().as_millis() >= UPDATE_SPEED {
                progress.emit_progress(&handle);
                last_update = std::time::Instant::now();
            }
        }

        progress.transfered = filesize;
        progress.percentage = 100.0;
        progress.emit_progress(&handle);
        progress.emit_finished(&handle);
    });
}

/// Extracts everything from the ZIP archive to the output directory
async fn unzip_file(archive: File, out_dir: &Path) {
    let archive = BufReader::new(archive).compat();
    let mut reader = ZipFileReader::new(archive).await.expect("Failed to read zip file");
    for index in 0..reader.file().entries().len() {
        let entry = reader.file().entries().get(index).unwrap();
        let path = out_dir.join(sanitize_file_path(entry.filename().as_str().unwrap()));
        // If the filename of the entry ends with '/', it is treated as a directory.
        // This is implemented by previous versions of this crate and the Python Standard Library.
        // https://docs.rs/async_zip/0.0.8/src/async_zip/read/mod.rs.html#63-65
        // https://github.com/python/cpython/blob/820ef62833bd2d84a141adedd9a05998595d6b6d/Lib/zipfile.py#L528
        let entry_is_dir = entry.dir().unwrap();

        let mut entry_reader = reader.reader_without_entry(index).await.expect("Failed to read ZipEntry");

        if entry_is_dir {
            // The directory may have been created if iteration is out of order.
            if !path.exists() {
                create_dir_all(&path).await.expect("Failed to create extracted directory");
            }
        } else {
            // Creates parent directories. They may not exist if iteration is out of order
            // or the archive does not contain directory entries.
            let parent = path.parent().expect("A file entry should have parent directories");
            if !parent.is_dir() {
                create_dir_all(parent).await.expect("Failed to create parent directories");
            }
            let writer = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&path)
                .await
                .expect("Failed to create extracted file");
            futures_lite::io::copy(&mut entry_reader, &mut writer.compat_write())
                .await
                .expect("Failed to copy to extracted file");

            // Closes the file and manipulates its metadata here if you wish to preserve its metadata from the archive.
        }
    }
}

#[tauri::command]
async fn extract_file(archive_path: String, extract_path: String) {
  let archive = File::open(archive_path).await.expect("Failed to open archive");
  let out_dir: &Path = Path::new(&extract_path);
  unzip_file(archive, out_dir).await;
}

#[tauri::command]
async fn download_file(id: String, url: String, directory: String, filename: String, app: tauri::AppHandle) {
    start_download(url, directory, filename, id, app).await;
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_upload::init())
        .invoke_handler(tauri::generate_handler![extract_file])
        .invoke_handler(tauri::generate_handler![download_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
