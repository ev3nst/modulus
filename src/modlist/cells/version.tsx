import { TableCell } from '@/components/table';

import type { ModItemSeparatorUnion } from '@/lib/api';
import { settingStore } from '@/lib/store/setting';
import { isSeparator } from '@/modlist/utils';

export const Version = ({ mod }: { mod: ModItemSeparatorUnion }) => {
	if (isSeparator(mod)) return;

	let version = 'version' in mod ? mod.version : undefined;
	const toggle_version = settingStore(state => state.toggle_version);
	if (toggle_version) {
		if (typeof version === 'number') {
			try {
				const dateVersion = new Date(version).toLocaleDateString();
				return <TableCell className="text-xs">{dateVersion}</TableCell>;
			} catch (_e) {}
		}

		return <TableCell className="text-xs">{version ?? ''}</TableCell>;
	}
};
