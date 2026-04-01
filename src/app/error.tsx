'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons-round text-3xl">error_outline</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    We're sorry, but the application encountered an unexpected error while trying to load the menu.
                </p>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 py-3 px-4 bg-slate-100 text-slate-900 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}
