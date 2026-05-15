import React from 'react';
import styles from '@/styles/components/ProgressBar.module.css';

interface ProgressBarProps {
    isActive: boolean;
    message?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    isActive,
    message = 'កំពុងដំណើរការឯកសាររបស់អ្នក...',
}) => {
    if (!isActive) return null;

    return (
        <div className={styles.container}>
            <div className={styles.progressBar}>
                <div className={styles.progress} />
            </div>
            <p className={styles.message}>{message}</p>
        </div>
    );
};

export default ProgressBar;
