import LoaderScreen from '@/components/loader-screen';
import { createContext, useContext, useState } from 'react';

interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
    undefined,
);

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
            {isLoading && <LoaderScreen />}
        </LoadingContext.Provider>
    );
}
