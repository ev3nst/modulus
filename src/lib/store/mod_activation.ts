import {
	ModGenericModel,
	ModGenericProps,
	ModelConstructor,
	createStore,
} from '@/lib/store/mod_generic';
import { profileStore } from '@/lib/store/profile';
import { modsStore, type ModItem } from '@/lib/store/mods';
import {
	getChildMods,
	isSeparator,
	type ModItemSeparatorUnion,
} from '@/lib/store/mod_separator';
import { SaveFile } from '@/lib/store/save_files';
import { settingStore } from './setting';

export type ModActivationItem = {
	mod_id: string;
	is_active: boolean;
	title: string;
};

export type ModActivation = ModGenericProps<ModActivationItem>;
export class ModActivationModel extends ModGenericModel<
	ModActivation,
	ModActivationItem
> {
	protected getTableName(): string {
		return 'mod_activations';
	}
}

const customSyncData = async (dataToSync: ModActivationItem[]) => {
	const { profile } = profileStore.getState();
	const instance = await ModActivationModel.retrieve(profile.id);
	const mods = modsStore.getState().mods;
	if (instance) {
		instance.data = dataToSync.map(d => {
			const mod = mods.find(m => m.identifier === d.mod_id);
			if (!mod) return d;
			if (isSeparator(mod)) return d;

			const isBaseAndAlwaysActive =
				(mod as ModItem).item_type === 'base_mod' &&
				mod.identifier !== 'BirthAndDeath';
			if (isBaseAndAlwaysActive) {
				return {
					...d,
					is_active: true,
				};
			}

			return d;
		});
		await instance.save();
	}
};
export const modActivationStore = createStore<
	ModActivation,
	ModActivationModel,
	ModActivationItem,
	{
		saveFile?: SaveFile;
		setSaveFile: (saveFile?: SaveFile) => void;
		requiredItemsModal: boolean;
		setRequiredItemsModal: (requiredItemsModal: boolean) => void;
		requiredItemsMod?: ModItem;
		setRequiredItemsMod: (requiredItemsMod?: ModItem) => void;
	}
>({
	model: ModActivationModel as ModelConstructor<
		ModActivation,
		ModActivationModel,
		ModActivationItem
	>,
	initialState: [],
	customSyncData,
	extend: set => ({
		saveFilePath: undefined,
		setSaveFile: saveFile => {
			set({ saveFile });
		},

		requiredItemsModal: false,
		setRequiredItemsModal: requiredItemsModal =>
			set({ requiredItemsModal }),
		requiredItemsMod: undefined,
		setRequiredItemsMod: requiredItemsMod => set({ requiredItemsMod }),
	}),
});

const processDependencies = (
	modId: string,
	shouldActivate: boolean,
	updatedActivation: ModActivationItem[],
	mods: ModItemSeparatorUnion[],
): ModActivationItem[] => {
	const currentMod = mods.find(m => m.identifier === modId) as ModItem;
	if (!currentMod || isSeparator(currentMod)) return updatedActivation;

	let result = updatedActivation;
	if (!shouldActivate && currentMod.item_type === 'steam_mod') {
		const dependentModIds = new Set(
			mods
				.filter(
					otherMod =>
						!isSeparator(otherMod) &&
						(otherMod as ModItem).item_type !== 'base_mod' &&
						(otherMod as ModItem).required_items.includes(modId) &&
						result.some(
							ma =>
								ma.is_active &&
								ma.mod_id === otherMod.identifier,
						),
				)
				.map(dm => dm.identifier),
		);

		if (dependentModIds.size > 0) {
			result = result.map(item =>
				dependentModIds.has(item.mod_id)
					? { ...item, is_active: false }
					: item,
			);
		}
	}

	if (
		shouldActivate &&
		currentMod.item_type === 'steam_mod' &&
		currentMod.required_items.length > 0
	) {
		const missingDependencyIds = new Set(
			currentMod.required_items.filter(
				requiredId =>
					result.some(
						ma => ma.mod_id === requiredId && !ma.is_active,
					) &&
					(mods.find(m => m.identifier === requiredId) as ModItem)
						.item_type !== 'base_mod',
			),
		);

		if (missingDependencyIds.size > 0) {
			result = result.map(item =>
				missingDependencyIds.has(item.mod_id)
					? { ...item, is_active: true }
					: item,
			);
		}
	}

	return result;
};

export const toggleModActivation = (
	checked: boolean,
	mod: ModItem,
	dependency_confirmation_override?: boolean,
) => {
	const mods = modsStore.getState().mods;
	const storeState = modActivationStore.getState();
	const {
		data: modActivation,
		setData: setModActivation,
		setRequiredItemsModal,
		setRequiredItemsMod,
	} = storeState;
	const dependency_confirmation =
		typeof dependency_confirmation_override !== 'undefined'
			? dependency_confirmation_override
			: settingStore.getState().dependency_confirmation;

	let updatedModActivation = modActivation.map(item =>
		item.mod_id === mod.identifier ? { ...item, is_active: checked } : item,
	);

	setModActivation(updatedModActivation);
	if (!checked && mod.item_type === 'steam_mod') {
		const dependentModIds = new Set(
			mods
				.filter(
					otherMod =>
						!isSeparator(otherMod) &&
						(otherMod as ModItem).item_type !== 'base_mod' &&
						(otherMod as ModItem).required_items.includes(
							mod.identifier,
						) &&
						updatedModActivation.some(
							ma =>
								ma.is_active &&
								ma.mod_id === otherMod.identifier,
						),
				)
				.map(dm => dm.identifier),
		);

		if (dependentModIds.size > 0) {
			if (dependency_confirmation) {
				setRequiredItemsModal(true);
				setRequiredItemsMod(mod);
				return;
			} else {
				setModActivation(
					updatedModActivation.map(item =>
						dependentModIds.has(item.mod_id)
							? { ...item, is_active: false }
							: item,
					),
				);
				return;
			}
		}
	}

	if (
		checked &&
		mod.item_type === 'steam_mod' &&
		mod.required_items.length > 0
	) {
		const missingDependencyIds = new Set(
			mod.required_items.filter(requiredId =>
				updatedModActivation.some(
					ma =>
						ma.mod_id === requiredId &&
						!ma.is_active &&
						(mods.find(m => m.identifier === requiredId) as ModItem)
							.item_type !== 'base_mod',
				),
			),
		);

		if (missingDependencyIds.size > 0) {
			if (dependency_confirmation) {
				setRequiredItemsModal(true);
				setRequiredItemsMod(mod);
				return;
			} else {
				setModActivation(
					updatedModActivation.map(item =>
						missingDependencyIds.has(item.mod_id)
							? { ...item, is_active: true }
							: item,
					),
				);
				return;
			}
		}
	}
};

export const toggleSeparatorActivation = (mod: ModItemSeparatorUnion) => {
	const mods = modsStore.getState().mods;
	const { data: modActivation, setData: setModActivation } =
		modActivationStore.getState();

	const childMods = getChildMods(mods, mod.identifier);
	const shouldActivate = childMods.some(item =>
		modActivation.some(
			ma => ma.mod_id === item.identifier && !ma.is_active,
		),
	);

	let updatedModActivation = modActivation.map(activation =>
		childMods.some(item => item.identifier === activation.mod_id)
			? { ...activation, is_active: shouldActivate }
			: activation,
	);

	childMods.forEach(item => {
		updatedModActivation = processDependencies(
			item.identifier,
			shouldActivate,
			updatedModActivation,
			mods,
		);
	});

	setModActivation(updatedModActivation);
};
