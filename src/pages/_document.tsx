import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Content Security Policy for OAuth providers */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.magic.link https://telegram.org https://web.telegram.org; frame-src 'self' https://auth.magic.link https://verify.magic.link https://oauth.telegram.org;" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
