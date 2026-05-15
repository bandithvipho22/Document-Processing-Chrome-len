import type { AppProps } from 'next/app';
import Head from 'next/head';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Document OCR - Extract Text from Images & PDFs</title>
            </Head>
            <LanguageProvider>
                <Component {...pageProps} />
            </LanguageProvider>
        </>
    );
}

export default MyApp;
