// Memuat modul yang diperlukan untuk mengirim email, mengelola path file, dan eksekusi perintah shell
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { exec } = require('child_process');

// Fungsi untuk mengenkripsi file PDF menggunakan qpdf
async function encryptPDF(
  inputFilePath,   // Path ke file PDF asli yang akan dienkripsi
  outputFilePath,  // Path untuk menyimpan file PDF terenkripsi
  userPassword,    // Password untuk pengguna (read-only access)
  ownerPassword    // Password untuk pemilik (full access)
) {
  try {
    // Membangun perintah shell untuk mengenkripsi PDF menggunakan qpdf
    const command = `"C:\\Program Files\\qpdf 11.9.1\\bin\\qpdf.exe" --encrypt ${ownerPassword} ${userPassword} 256 -- "${inputFilePath}" "${outputFilePath}"`;

    // Menjalankan perintah shell untuk mengenkripsi file PDF
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Jika terjadi kesalahan saat menjalankan perintah, tampilkan pesan error
        console.error(`Error: ${error.message}`);
        throw error;
      }
      if (stderr) {
        // Jika terjadi kesalahan saat eksekusi, tampilkan pesan dari stderr
        console.error(`Stderr: ${stderr}`);
        throw new Error(stderr);
      }
      // Jika sukses, tampilkan pesan bahwa PDF berhasil dienkripsi
      console.log(`PDF berhasil dienkripsi dan disimpan di: ${outputFilePath}`);
    });
  } catch (error) {
    // Tangani kesalahan yang terjadi selama proses enkripsi
    console.error("Error encrypting PDF:", error);
    throw error;
  }
}

// Fungsi untuk mengirim email dengan lampiran PDF yang telah dienkripsi
async function kirimEmail() {
  // Mengatur konfigurasi transportasi email menggunakan Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mhmdryhan02@gmail.com",  // Email pengirim
      pass: "peoa kndm odan tjcp",    // Password aplikasi Gmail (bukan password biasa)
    },
  });

  // Tentukan path ke file PDF asli dan file PDF yang akan dienkripsi
  const inputFilePath = path.join(
    "D:",
    "PROJECT_PK-KM",
    "encript_email_api",
    "file",
    "email.pdf"
  );
  const encryptedFilePath = path.join(
    "D:",
    "PROJECT_PK-KM",
    "encript_email_api",
    "file-encrypted",
    "email-encrypted.pdf" // Nama file output PDF yang sudah terenkripsi
  );

  // Panggil fungsi untuk mengenkripsi PDF sebelum dilampirkan di email
  try {
    await encryptPDF(inputFilePath, encryptedFilePath, "yoga", "ryhan");
  } catch (error) {
    // Jika terjadi kesalahan saat enkripsi, tampilkan pesan error dan hentikan proses
    console.error("Gagal mengenkripsi PDF:", error);
    return;
  }

  // Mengatur opsi email, termasuk alamat penerima, subjek, teks, dan lampiran
  const mailOptions = {
    from: "mhmdryhan02@gmail.com",       // Email pengirim
    to: "yogadwisatya.giri@gmail.com",   // Email penerima
    subject: "Email Locker",             // Subjek email
    text: "Ini adalah email dengan lampiran PDF yang sudah terkunci.",  // Teks dalam email
    attachments: [
      {
        filename: "email.pdf",           // Nama file yang muncul di lampiran email
        path: encryptedFilePath,         // Path ke file PDF yang sudah terenkripsi
      },
    ],
  };

  // Mengirim email dengan menggunakan pengaturan di atas
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email Berhasil dikirim: " + info.response);
  } catch (error) {
    // Jika terjadi kesalahan saat pengiriman email, tampilkan pesan error
    console.error("Gagal mengirim email:", error);
  } finally {
    // Setelah email dikirim, hapus file PDF yang terenkripsi dari sistem
    if (fs.existsSync(encryptedFilePath)) {
      fs.unlinkSync(encryptedFilePath);
    }
  }
}

// Panggil fungsi untuk mengirim email
kirimEmail();
