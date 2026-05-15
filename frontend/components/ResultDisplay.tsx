import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/styles/components/ResultDisplay.module.css';

interface ResultDisplayProps {
    text: string;
    filename?: string;
    processingTime?: number;
    confidence?: number;
    onCopy?: () => void;
    onDownload?: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    text,
    filename,
    processingTime,
    confidence,
    onCopy,
    onDownload,
}) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
        );
        element.setAttribute(
            'download',
            `${filename || 'document'}-ocr.txt`
        );
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        onDownload?.();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>{t('results')}</h2>
                    {filename && (
                        <p className={styles.filename}>{t('file')}: {filename}</p>
                    )}
                </div>
                <div className={styles.actions}>
                    {confidence && (
                        <div className={styles.confidence}>
                            <span className={styles.label}>{t('accuracy')}:</span>
                            <span className={styles.value}>
                                {(confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                    {processingTime && (
                        <div className={styles.processingTime}>
                            <span className={styles.label}>{t('time')}:</span>
                            <span className={styles.value}>
                                {processingTime.toFixed(2)}s
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.btn} onClick={handleCopy} title={t('copy')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
                    </svg>
                    {copied ? t('copied') : t('copy')}
                </button>
                <button className={styles.btn} onClick={handleDownload} title={t('download')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t('download')}
                </button>
            </div>

            <textarea
                className={styles.textarea}
                value={text}
                readOnly
                rows={15}
            />
        </div>
    );
};

export default ResultDisplay;
