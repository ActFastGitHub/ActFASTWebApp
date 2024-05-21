export interface ModeContextType {
	mode: boolean;
	setMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UserProps {
	id: string;
	name: string;
	ethnicity: string;
	gender: string;
	birthday: string;
	phonenumber: string;
	image: string;
	userEmail: string;
	location: {
		lng: number;
		lat: number;
		address: {
			fullAddress: string;
			pointOfInterest: string;
			city: string;
			country: string;
		};
	};
}

export interface LocationFeature {
	geometry: {
		coordinates: [number, number];
	};
	place_name: string;
	context: Array<{ text: string }>;
}

export interface LocationData {
	features: LocationFeature[];
}

export interface FormData {
	name: string;
	birthday: string;
	ethnicity: string;
	gender: string;
	phonenumber: string;
	location: {
		lng: number;
		lat: number;
		address: {
			fullAddress: string;
			pointOfInterest: string;
			city: string;
			country: string;
		};
	};
}
