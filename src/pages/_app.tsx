import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from 'src/contexts/AuthContext'
import Layout from '@components/Layouts/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
      <AuthProvider>
        <Layout >
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
  )
}
