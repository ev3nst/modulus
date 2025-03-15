import { ChangeEvent } from 'react';
import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';

type FilterProps = {
	activationFilter: string;
	setActivationFilter: (value: string) => void;
	searchModText: string;
	setSearchModText: (value: string) => void;
};

export const Filter = ({
	activationFilter,
	setActivationFilter,
	searchModText,
	setSearchModText,
}: FilterProps) => {
	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
		setSearchModText(event.currentTarget.value);

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-zinc-900 w-full flex gap-4">
			<div>
				<Select
					value={activationFilter}
					onValueChange={value => setActivationFilter(value)}
				>
					<SelectTrigger
						className="w-[100px] justify-center rounded-none h-full border-t-0 border-l-0 border-b-0"
						disableIcon
					>
						<SelectValue placeholder={activationFilter} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="passive">Passive</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex-grow relative">
				<SearchIcon className="absolute left-0 bottom-[12px] w-3.5 h-3.5 text-muted-foreground" />
				<Input
					className="rounded-none ps-6 h-10 border-0"
					placeholder="C: Category (Optional) - Search Term ..."
					defaultValue={searchModText}
					onChange={handleSearchChange}
				/>
			</div>
		</div>
	);
};
