import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons-round text-3xl">search_off</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    The requested menu or dish could not be found. It may have been removed or the link might be incorrect.
                </p>
                <Link
                    href="/"
                    className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
