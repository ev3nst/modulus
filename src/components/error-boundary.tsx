import React from 'react';

import { Button } from '@/components/button';
import { WindowActions } from '@/header/window-actions';

// Define the props type
interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

// Error Boundary Component
export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error('Error in component:', error, errorInfo);
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			return (
				<main>
					<div className="flex justify-between app-drag-region border-b fixed top-0 left-0 right-0 py-1">
						<div className="flex items-center gap-4 py-1 px-3">
							<img src="/logo.png" className="h-6 w-6" />
							<div className="text-sm font-bold">
								TW Mod Organizer
							</div>
						</div>
						<WindowActions className="px-1" />
					</div>
					<div className="flex items-center justify-center h-screen w-screen app-drag-region">
						<div className="relative text-center ">
							<h1 className="text-balance text-5xl font-semibold tracking-tight text-primary sm:text-7xl">
								Error
							</h1>
							<p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
								Unexpected error has occured.
							</p>

							<p className="mt-2 text-pretty text-md font-medium text-muted-foreground">
								You may check console for further details.
							</p>
							<div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-6 clickable-content">
								<Button
									onClick={() => {
										window.location.reload();
									}}
								>
									Reload
								</Button>
							</div>
						</div>
					</div>
				</main>
			);
		}

		return this.props.children;
	}
}
