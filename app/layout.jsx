import "../front end/src/styles.css";

export const metadata = {
  title: "Study Hub",
  description: "A student resource directory for TMU."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
