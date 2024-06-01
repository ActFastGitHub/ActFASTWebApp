// utils/groupAndCountNames.ts

interface Box {
	id: string;
	boxNumber: string;
	name: string;
	color: string;
	level: number;
	createdAt: Date;
	updatedAt: Date;
	lastModifiedById?: string;
	items: any[]; // Assuming you have an Item type, replace `any` with `Item`
}

interface GroupedName {
	name: string;
	count: number;
}

export function groupAndCountNames(boxes: Box[]): GroupedName[] {
	const nameCounts: Record<string, number> = {};

	boxes.forEach(box => {
		const name = box.name.trim().toUpperCase();
		if (nameCounts[name]) {
			nameCounts[name]++;
		} else {
			nameCounts[name] = 1;
		}
	});

	return Object.entries(nameCounts).map(([name, count]) => ({ name, count }));
}
