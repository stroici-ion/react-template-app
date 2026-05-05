import { useNavigate } from 'react-router-dom';

export function Logo({ className }: { className?: string }) {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className={`flex items-center justify-center gap-2 cursor-pointer ${className}`} onClick={handleLogoClick}>
            <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data<span className="text-blue-500 dark:text-blue-400">Hub</span></h1>
        </div>
    );
}