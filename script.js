const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const ctx = canvas.getContext('2d');

// Aktifkan kamera belakang
function startCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: "environment" } }
  })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.warn("Kamera belakang gagal, fallback ke kamera default.");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .catch(err => alert("Gagal akses kamera sama sekali: " + err));
  });
}

// Ambil foto dan beri stempel nama hari + waktu
function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const now = new Date();
  const hari = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const waktuLengkap = now.toLocaleString('id-ID');
  const stamp = `${hari}, ${waktuLengkap}`;

  ctx.fillStyle = 'yellow';
  ctx.font = '30px Arial';
  ctx.fillText(stamp, 20, canvas.height - 30);

  const dataUrl = canvas.toDataURL('image/jpeg');
  preview.src = dataUrl;
}

// Upload ke Dropbox
function uploadPhoto() {
  if (!preview.src) {
    alert("Silakan ambil foto terlebih dahulu.");
    return;
  }

  const base64 = preview.src.split(',')[1];
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `/foto_tim_${now}.jpg`;

  fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      "Authorization": "Bearer sl.u.AF5TeTOV8dQYg_5mt4t6LUilD14zHPWfhMEhG3Uy-rcZSqWd-RLN29JsVt9XOBto-raOmOiesE4NJhxNNfaZZsgcya4Noiacry4o3_5lELJq98IyjAkPEUhxUqmtBI2RblJuEiAsVL5rnAW_tla_-It6qPLH0DK7R9arYuKXTGXeoHFw0_7BX6K9WXrMm7llPtJy5KGTZopvuYnaAtUOQfHyrCva_J1_ftyJj8DF71i1nKSqfGZ_0EpS70lY6mgQIb96hJVwu00co-L-UZ2_iJLbFlH_tg913kl7eDqTkQkoZlIJvj4OM2AbAUYFRSjieG4K0jT8fhyUqUM5a6GGmpkM5yzQaGvAiLB78IC2U2v1L4N1sotZP-2ey7uN2S2bH2INZf84srehm3sNQq2DO77cEH23vhMeK2t-6PsvPDF7U5BDwtUumGXYwBoXbQ5Ws1GsKUhPd-nrpDZQKMVx3VdLBgx1nyx5NnIZyyvcMwRsvZHHPz9N-0-ArgQsiLyyN9CBno6OXNI5WQHCcrhnq7xBkYq0DUmfRzjb98NCIJDW6FsxMEacVQfR6b1q0STtcTKJt-oXLzKH9PwXQPQDnmc7ukdJkuQz3MRPRvagXjPZxQFSXgzEpHPAz2HSbhti5fBmmr2K5H7NfkN4jymmseUHJfXXJkpKqM4vLVJQCOo5Q7R-0T3oMkBUEM1ZK5cWtOY5CxpliFwAtulkFv3JlDorhYvwlhI5mqqZNS3gozjAtfJ8UPEQsCHTceSKkx2N0OgfgcQRY1YdDtfQfmMUpZ8EZbYh0pfZNi8q-StEgLSdtn9uyQqvJ0xSGh3DybGmpb_g9PWfkThsSpLfhG2byGX978P0aMj7eOTBHpW8LMocFy3BUWtO3gcrV7REitnntv7X3O38BqJ3T2u70fakSZ4rvN3XXCyyWgzVQ-bxXjhF2MVDETqPE8HGUl51mNJd_gJv-kKrVG29wKK1SRo33sE8AGuZsOSmpA14XXWFS9WAkV6Qr3tw8oyt7a8MhN-_b4ht8TUzJKIz2_sDvBjVVtgwv2fxcwCji4Vris-pcfqKYBxfy2RNujtXYFdXDgsW6otBO6xKkha4gMrKnusPXwIJAHqsDfNSwTE8f-9YVUtHHUvIbmlnKWDfXS427XT2Ugk0mazIQUB1R-EZlDWqwRszXDkhVNoUzDtelSGpI-IxFD9nUV_y5dfunyIvAvMB8VBrxERr8qudpWexHyY2PU82jR1jwN3vRePJxE6lhmHP-ikFKaQGDIEfKrSJIAsXfmhuQWfkSdiA8r9gx_tel9SWYvIS39b5C0HEY1iaympKZ95esPqPSax2K8KBVwvfJQqYsOGeOYHdgTfaJZBFP1KeuMUUsA5FMGxWbos4VkhqTHzz-UBgulPowjWnkzC9zEB07WroQ0DH8qRq1SguGYMIX57I5i5GnjcKSobDxVzZGg",
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: filename,
        mode: "add",
        autorename: true,
        mute: false
      })
    },
    body: Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  })
  .then(res => res.json())
  .then(data => {
    if (data.name) {
      alert("✅ Foto sudah diupload. Terimakasih, tetap semangat OCS NFI Teams!");
    } else {
      console.error(data);
      alert("❌ Upload gagal.");
    }
  })
  .catch(err => {
    console.error(err);
    alert("❌ Terjadi kesalahan saat upload.");
  });
}

// Jalankan kamera saat halaman dimuat
window.onload = startCamera;