import './gloabel.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title></title>
      </head>
      <body>{children}</body>
    </html>
  );
}
