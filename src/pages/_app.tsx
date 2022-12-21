import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '@components/layouts/Layout'
import { AuthProvider } from 'src/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
      <AuthProvider>
        <Layout >
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
  )
}
