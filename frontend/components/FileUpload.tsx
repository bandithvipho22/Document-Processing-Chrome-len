import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/styles/components/FileUpload.module.css';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
    maxFileSize?: number;
    acceptedFormats?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    isLoading = false,
    maxFileSize = 10 * 1024 * 1024,
    acceptedFormats = ['image/png', 'image/jpeg', 'application/pdf'],
}) => {
    const { t } = useLanguage();
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const validateFile = (file: File): boolean => {
        if (file.size > maxFileSize) {
            setError(`${t('file_size_error')} ${maxFileSize / 1024 / 1024}MB`);
            return false;
        }

        if (!acceptedFormats.includes(file.type)) {
            setError(t('file_format_error'));
            return false;
        }

        setError(null);
        return true;
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files[0]) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            } else {
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <div className={styles.container}>
            <div
                className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${isLoading ? styles.disabled : ''
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleChange}
                    disabled={isLoading}
                    className={styles.input}
                />
                <label htmlFor="file-input" className={styles.label}>
                    <div className={styles.icon}>
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <div className={styles.text}>
                        <p className={styles.title}>{t('dropzone_primary')}</p>
                        <p className={styles.subtitle}>
                            {t('dropzone_secondary')}
                        </p>
                        <p className={styles.hint}>
                            Max size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                        </p>
                    </div>
                </label>
            </div>

            {selectedFile && !isLoading && (
                <div className={styles.fileInfo}>
                    <div className={styles.fileName}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                        <span>{selectedFile.name}</span>
                    </div>
                    <span className={styles.fileSize}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                    </span>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
