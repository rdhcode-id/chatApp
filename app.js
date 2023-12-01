// Impor modul yang diperlukan
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

// Inisialisasi aplikasi Express dan server HTTP
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Inisialisasi koneksi ke Supabase
const supabaseUrl = "https://moehazhsxrbjiobiurdc.supabase.co"; // Ganti dengan URL Supabase Anda
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWhhemhzeHJiamlvYml1cmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0MjYxNTAsImV4cCI6MjAxNzAwMjE1MH0.85Aa00G-0x1ZgPe0KT2FE8T7V79U2fHTfD0ls_romo8"; // Ganti dengan API Key Supabase Anda
const supabase = createClient(supabaseUrl, supabaseKey);

// Event handler saat klien terkoneksi ke server WebSocket
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      // Simpan pesan ke Realtime Database Supabase
      const { data, error } = await supabase
        .from("messages")
        .insert([{ text: message }]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error inserting message to Supabase:", error);
    }
  });
});

// Mendengarkan perubahan pada Realtime Database Supabase
supabase.from("messages").on("INSERT", (payload) => {
  const newMessage = payload.new;

  // Kirim pesan ke semua klien yang terhubung ke WebSocket
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(newMessage.text);
    }
  });
});

// Serve halaman HTML
app.use(express.static("public")); // Direktori 'public' berisi file index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Jalankan server pada port tertentu
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
