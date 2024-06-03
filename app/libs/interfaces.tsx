export interface ModeContextType {
	mode: boolean;
	setMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UserProps {
	id: string;
	lastName: string;
	firstName: string;
	nickname: string;
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
	properties: {
		full_address: string;
		context: {
			address: { name: string };
			place: { name: string };
			country: { name: string };
		};
	};
}

export interface LocationData {
	features: LocationFeature[];
}

export interface FormData {
	lastName: string;
	firstName: string;
	nickname: string;
	birthday: string;
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

export interface APIErr {
	code: number;
	message: string;
	cause: string | Error;
}
