import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Info,
    AlertTriangle,
    X,
} from 'lucide-react';
import type {
    AlertItem,
    AlertKind,
    AlertPosition,
} from '../../hooks/useAlert';

const EXIT_MS = 200;

const positionClasses: Record<AlertPosition, string> = {
    'top-left': 'top-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
};

const kindStyles: Record<AlertKind, { container: string; icon: string }> = {
    success: {
        container:
            'bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
        icon: 'text-green-500 dark:text-green-400',
    },
    error: {
        container:
            'bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
        icon: 'text-red-500 dark:text-red-400',
    },
    info: {
        container:
            'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
        icon: 'text-blue-500 dark:text-blue-400',
    },
    warning: {
        container:
            'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
        icon: 'text-yellow-500 dark:text-yellow-400',
    },
};

const kindIcons: Record<AlertKind, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
};

const enterFromClass = (position: AlertPosition) => {
    if (position.startsWith('top')) return '-translate-y-3 opacity-0';
    return 'translate-y-3 opacity-0';
};

interface ToastProps {
    alert: AlertItem;
    position: AlertPosition;
    onDismiss: (id: string) => void;
}

function Toast({ alert, position, onDismiss }: ToastProps) {
    const [entered, setEntered] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const styles = kindStyles[alert.kind];

    useEffect(() => {
        const raf = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const handleClose = () => {
        if (leaving) return;
        setLeaving(true);
        setTimeout(() => onDismiss(alert.id), EXIT_MS);
    };

    const visibleClass = entered && !leaving
        ? 'translate-y-0 opacity-100 scale-100'
        : leaving
            ? 'opacity-0 scale-95'
            : enterFromClass(position);

    return (
        <div
            role={alert.kind === 'error' ? 'alert' : 'status'}
            aria-live={alert.kind === 'error' ? 'assertive' : 'polite'}
            className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-200 ease-out ${styles.container} ${visibleClass}`}
        >
            <div className={`shrink-0 ${styles.icon}`}>{kindIcons[alert.kind]}</div>
            <p className="flex-1 text-sm font-medium leading-snug break-words">
                {alert.message}
            </p>
            <button
                type="button"
                onClick={handleClose}
                aria-label="Dismiss notification"
                className="shrink-0 cursor-pointer rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

interface ToastStackProps {
    alerts: AlertItem[];
    position: AlertPosition;
    onDismiss: (id: string) => void;
}

export function ToastStack({ alerts, position, onDismiss }: ToastStackProps) {
    return (
        <div
            aria-live="polite"
            className={`pointer-events-none fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
        >
            {alerts.map((alert) => (
                <Toast
                    key={alert.id}
                    alert={alert}
                    position={position}
                    onDismiss={onDismiss}
                />
            ))}
        </div>
    );
}
