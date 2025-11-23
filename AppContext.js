import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';
import { useAppStore as useAppStoreHook } from './useAppStore.js';

export const AppContext = createContext(null);

export const useStore = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useStore must be used within an AppContext.Provider. This is a critical error in the application setup.");
    }
    return context;
};

// This hook is now only used in the main entry file to initialize the store.
export const useAppStore = useAppStoreHook;