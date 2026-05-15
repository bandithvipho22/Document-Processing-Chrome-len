import Document from 'next/document';
import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
    return (
        <Html lang="en">
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="Advanced OCR System - Extract text from images and PDFs" />
                <meta name="keywords" content="OCR, text extraction, image to text, PDF to text" />
                <meta name="author" content="Document OCR Team" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
