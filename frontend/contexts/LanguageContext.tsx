import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'km';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        'title': 'Extract Text from Documents',
        'subtitle': 'Use OCR technology to extract words from images and PDFs',
        'dropzone_primary': 'Drop your file or click to select',
        'dropzone_secondary': 'or click to select PNG, JPG, or PDF',
        'submit': 'Process OCR',
        'processing': 'Processing...',
        'clear': 'Clear',
        'processing_message': 'Processing your document...',
        'error': 'Error',
        'select_file_error': 'Please select a file',
        'file_size_error': 'File size must be less than',
        'file_format_error': 'File format not supported. Please upload PNG, JPG, or PDF.',
        'unknown_error': 'Unknown error',
        'ocr_failed': 'OCR extraction failed',
        'results': 'Results',
        'file': 'File',
        'accuracy': 'Accuracy',
        'time': 'Time',
        'copy': 'ចម្លង',
        'copied': 'ចម្លងរួច!',
        'download': 'ទាញយក',
        'extract_another': 'Extract another document',
    },
    km: {
        'title': 'ស្រង់អត្ថបទពីឯកសារ',
        'subtitle': 'ប្រើប្រាស់បច្ចេកវិទ្យា OCR ដើម្បីស្រង់ពាក្យពីរូបភាព និង PDF',
        'dropzone_primary': 'ទម្លាក់ឯកសាររបស់អ្នក',
        'dropzone_secondary': 'ឬចុចដើម្បីជ្រើសរើស PNG, JPG, ឬ PDF',
        'submit': 'ដំណើរការ OCR',
        'processing': 'កំពុងដំណើរការ...',
        'clear': 'សម្អាត',
        'processing_message': 'កំពុងដំណើរការឯកសាររបស់អ្នក...',
        'error': 'កំហុស',
        'select_file_error': 'សូមជ្រើសរើសឯកសារមួយ',
        'file_size_error': 'ទំហំឯកសារត្រូវតែតូចជាង',
        'file_format_error': 'ទម្រង់ឯកសារមិនប្រើបាន។ សូមបង្ហោះ PNG, JPG, ឬ PDF។',
        'unknown_error': 'កំហុសមិនស្គាល់',
        'ocr_failed': 'ការស្រង់ឆ្ងាយ OCR បានបរាជ័យ',
        'results': 'លទ្ធផល',
        'file': 'ឯកសារ',
        'accuracy': 'ភាពត្រឹមត្រូវ',
        'time': 'ពេលវេលា',
        'copy': 'ចម្លង',
        'copied': 'ចម្លងរួច!',
        'download': 'ទាញយក',
        'extract_another': 'ស្រង់ឯកសារផ្សេងទៀត',
    },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [language, setLanguageState] = useState<Language>('km');

    useEffect(() => {
        // Load language preference from localStorage
        const savedLanguage = localStorage.getItem('language') as Language | null;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'km')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
