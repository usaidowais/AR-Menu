import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                poster?: string;
                alt?: string;
                'shadow-intensity'?: string;
                'camera-controls'?: boolean;
                'touch-action'?: string;
                ar?: boolean;
                'ar-scale'?: string;
                'ar-modes'?: string;
                'on-ar-status'?: (e: any) => void;
                class?: string;
            }, HTMLElement>;
        }
    }
}
