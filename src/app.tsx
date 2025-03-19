import { useEffect, useState, useCallback } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/sidebar';
import { TooltipProvider } from '@/components/tooltip';
import { Loading } from '@/components/loading';

import { settingStore } from '@/lib/store/setting';
import { ProfileModel, profileStore } from '@/lib/store/profile';

import { toastError } from '@/lib/utils';

import { ConflictDetails } from '@/dialogs/conflict-details';
import { SetPriorityDialog } from '@/dialogs/set-priority';
import { MetaInformationDialog } from '@/dialogs/meta-information';
import { RemoveModDialog } from '@/dialogs/remove-mod';
import { EditSeparator } from '@/dialogs/edit-separator';
import { BulkCategory } from '@/dialogs/bulk-category';
import { RequiredItemsDialog } from '@/dialogs/required-items';

import { Header } from './header';
import { ModList } from './modlist';
import { AppSidebar } from './sidebar';

function App() {
	const [fetchAppManageLoading, setFetchAppManageLoading] = useState(true);

	const setLoading = settingStore(state => state.setLoading);
	const selectedGame = settingStore(state => state.selectedGame);

	const setProfile = profileStore(state => state.setProfile);
	const setProfiles = profileStore(state => state.setProfiles);

	const init = useCallback(async () => {
		try {
			const profile = await ProfileModel.currentProfile(
				selectedGame!.steam_id,
			);
			setProfile(profile);

			const profiles = await ProfileModel.all(selectedGame!.steam_id);
			setProfiles(profiles);
		} catch (error) {
			toastError(error);
		} finally {
			setFetchAppManageLoading(false);
			setLoading(false);
		}
	}, [selectedGame!.steam_id]);

	useEffect(() => {
		init();

		// Prevent CTRL + F from opening the browser search
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === 'f') {
				event.preventDefault();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [init]);

	if (fetchAppManageLoading) return <Loading />;

	return (
		<div className="[--header-height:calc(theme(spacing.14))] h-screen w-screen overflow-hidden">
			<TooltipProvider>
				<SidebarProvider className="flex flex-col" defaultOpen>
					<Header />
					<div className="flex flex-1">
						<SidebarInset>
							<ModList />
							<ConflictDetails />
							<SetPriorityDialog />
							<MetaInformationDialog />
							<EditSeparator />
							<RemoveModDialog />
							<BulkCategory />
							<RequiredItemsDialog />
						</SidebarInset>
						<AppSidebar />
					</div>
				</SidebarProvider>
			</TooltipProvider>
		</div>
	);
}

export default App;
