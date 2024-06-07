export interface ModeContextType {
  mode: boolean;
  setMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UserProps {
  id: string;
  lastName?: string;
  firstName?: string;
  nickname?: string;
  birthday?: string;
  phonenumber?: string;
  image?: string;
  userEmail: string;
  location?: {
    lng: number;
    lat: number;
    address: {
      fullAddress: string;
      pointOfInterest: string;
      city: string;
      country: string;
    };
  };

  role?: string;
  employeeID?: string;
  driversLicense?: string;
  active?: boolean;
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

export interface ProjectProps {
  id: string;
  code: string;
  insured: string;
  address: string;
  email: string;
  phoneNumber: string;
  insuranceProvider: string;
  claimNo: string;
  adjuster: string;
  typeOfDamage: string;
  category: string;
  dateOfLoss: string;
  dateAttended: string;
  lockBoxCode: string;
  notes: string;
}

export interface EditProfileFormProps {
  isFormVisible: boolean;
  setIsFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  editProfileData: Partial<UserProps>;
  setEditProfileData: React.Dispatch<React.SetStateAction<Partial<UserProps>>>;
  editable: boolean;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Project {
  id: string;
  code: string;
  insured?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  insuranceProvider?: string;
  claimNo?: string;
  adjuster?: string;
  typeOfDamage?: string;
  category?: string;
  dateOfLoss?: string;
  dateAttended?: string;
  lockBoxCode?: string;
  notes?: string;
}

export interface ProfileData {
  id: string;
  lastName?: string;
  firstName?: string;
  nickname?: string;
  birthday?: string;
  phonenumber?: string;
  image?: string;
  employeeID?: string;
  role?: string;
  driversLicense?: string;
  active?: boolean;
  userEmail: string;
  location?: {
    address: {
      fullAddress: string;
    };
  };
}
