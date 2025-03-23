import Link, { LinkProps } from 'next/link';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface WelcomeLinkProps
    extends LinkProps,
        React.HTMLAttributes<HTMLAnchorElement> {
    children: ReactNode;
    className?: string;
    target?: React.HTMLAttributeAnchorTarget;
}

function WelcomeLink({ children, className, ...props }: WelcomeLinkProps) {
    return (
        <Link
            className={twMerge(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                'h-9 px-4 py-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground ' +
                    className
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
export { WelcomeLink };
