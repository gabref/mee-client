import { GoogleAnalytics } from 'nextjs-google-analytics'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { AuthProvider } from 'src/contexts/AuthContext'
import Layout from '@components/Layouts/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
      <AuthProvider>
        <Layout >
          <GoogleAnalytics trackPageViews gaMeasurementId='G-ZP7XDH9N5K' />
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
  )
}
