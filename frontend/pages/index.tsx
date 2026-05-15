import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultDisplay from '@/components/ResultDisplay';
import ProgressBar from '@/components/ProgressBar';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/styles/pages/index.module.css';

interface OCRResult {
    success: boolean;
    text?: string;
    filename?: string;
    processing_time?: number;
    confidence?: number;
    error?: string;
}

export default function Home() {
    const { t, language, setLanguage } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OCRResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const resultsRef = React.useRef<HTMLDivElement>(null);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!selectedFile) {
            setError(t('select_file_error'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Use Next.js API route instead of calling backend directly
            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            const data: OCRResult = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('ocr_failed'));
            }

            setResult(data);
            setSelectedFile(null);
            // Auto-scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : t('unknown_error');
            setError(message);
            console.error('OCR Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <div className={styles.titleWrapper}>
                            <h1 className={styles.title}>{t('title')}</h1>
                            <div className={styles.titleAccent}></div>
                        </div>
                        <button
                            className={styles.languageToggle}
                            onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
                            title={language === 'en' ? 'Switch to Khmer' : 'Switch to English'}
                            aria-label="Toggle language"
                        >
                            {language === 'en' ? '🇰🇭' : '🇺🇸'}
                        </button>
                    </div>
                    <p className={styles.subtitle}>
                        {t('subtitle')}
                    </p>
                </header>

                {/* Upload Section */}
                <section className={styles.uploadSection}>
                    <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

                    {selectedFile && (
                        <div className={styles.uploadActions}>
                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={isLoading || !selectedFile}
                            >
                                {isLoading ? t('processing') : t('submit')}
                            </button>
                            <button
                                className={styles.clearBtn}
                                onClick={() => {
                                    setSelectedFile(null);
                                    setResult(null);
                                }}
                                disabled={isLoading}
                            >
                                {t('clear')}
                            </button>
                        </div>
                    )}
                </section>

                {/* Progress Bar */}
                <ProgressBar isActive={isLoading} message={t('processing_message')} />

                {/* Error Alert */}
                {error && (
                    <div className={styles.alert}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2v2m0-4h-2V7h2v6z" />
                        </svg>
                        <div>
                            <p className={styles.alertTitle}>{t('error')}</p>
                            <p className={styles.alertMessage}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {result && result.success && result.text && (
                    <section className={styles.resultSection} ref={resultsRef}>
                        <ResultDisplay
                            text={result.text}
                            filename={result.filename}
                            processingTime={result.processing_time}
                            confidence={result.confidence}
                        />
                        <button
                            className={styles.startOverBtn}
                            onClick={() => {
                                setResult(null);
                                setSelectedFile(null);
                            }}
                        >
                            {t('extract_another')}
                        </button>
                    </section>
                )}
            </div>
        </main>
    );
}
