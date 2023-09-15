import { createContext } from 'react';
import { CanvasStore, WidgetRegistry } from '@/stores';

export interface CanvasContextProps {
    /** Widgets available to all of the blocks */
    widgets: WidgetRegistry;

    /** Store to provide */
    canvas: CanvasStore;
}

/**
 * Insight Context
 */
export const CanvasContext = createContext<CanvasContextProps | undefined>(
    undefined,
);
