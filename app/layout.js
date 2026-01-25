export const metadata = {
  title: "WHISPER · Clewdo",
  description: "Clewdo utility routes (render + tributes).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
