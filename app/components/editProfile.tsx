import {
  EditProfileFormProps,
  LocationData,
  LocationFeature,
} from "@/app/libs/interfaces";
import x from "@/app/images/x.svg";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import defaultProfileImage from "@/app/images/blank-profile.jpg";

const EditProfile: React.FC<EditProfileFormProps> = ({
  isFormVisible,
  setIsFormVisible,
  disabled,
  editProfileData,
  setEditProfileData,
  editable,
  setEditable,
  setDisabled,
}) => {
  const { data: session } = useSession();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<LocationFeature[]>([]);

  useEffect(() => {
    setAddress(editProfileData?.location?.address?.fullAddress || "");
  }, [isFormVisible]);

  async function handleLocationChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setAddress(val);

    const endpoint = `https://api.mapbox.com/search/geocode/v6/forward?q=${val}&country=ca&limit=3&proximity=ip&language=en&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
    try {
      const response = await axios.get(endpoint);
      setLocation(response.data);
      setSuggestions(response.data?.features);
    } catch (error) {
      console.error("Error getting location suggestions:", error);
      toast.error("Error getting suggestions. Please try again.");
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result?.toString();
        setImageBase64(base64Data!);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let formattedValue: string | RegExpMatchArray | null = value.replace(
      /\D/g,
      "",
    );
    if (formattedValue.length > 0) {
      formattedValue = formattedValue.match(/(\d{1,3})(\d{0,3})(\d{0,4})/);
      formattedValue = [
        formattedValue![1],
        formattedValue![2],
        formattedValue![3],
      ]
        .filter((group) => group.length > 0)
        .join("-");
    }
    setEditProfileData({ ...editProfileData, phonenumber: formattedValue });
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    const loadingToastId = toast.loading("Updating your profile...");

    const selectedFeature = location?.features[0];

    const requestBody = {
      ...editProfileData,
      location: {
        lng: location?.features[0]?.geometry.coordinates[0],
        lat: location?.features[0]?.geometry.coordinates[1],
        address: {
          fullAddress: selectedFeature?.properties.full_address,
          pointOfInterest: selectedFeature?.properties.context.address.name,
          city: selectedFeature?.properties.context.place.name,
          country: selectedFeature?.properties.context.country.name,
        },
      },
      image: imageBase64,
    };

    try {
      const response = await axios.patch(`api/user/profile`, requestBody);

      toast.dismiss(loadingToastId);

      if (response.data.status !== 200) {
        const errorMessage = response.data?.error || "An error occurred";
        toast.error(errorMessage);
        setTimeout(() => setDisabled(false), 2000);
      } else {
        toast.success("Profile successfully updated");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.dismiss(loadingToastId);
      toast.error("An error occurred while updating your profile.");
      setTimeout(() => setDisabled(false), 2000);
    }
  };

  return (
    isFormVisible && (
      <main className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-gray-800 bg-opacity-50 p-4 pt-72 md:pt-2 lg:pt-72 xl:pt-72">
        <div className="relative mx-4 mt-16 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
          <img
            src={x.src}
            alt="Close"
            width={20}
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => {
              setIsFormVisible(!isFormVisible);
              setEditable(false);
            }}
          />
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`${editable ? "" : "pointer-events-none"}`}
            >
              {imageBase64 ? (
                <img
                  src={imageBase64}
                  alt="Selected File"
                  className="mt-4 h-[100px] w-[100px] cursor-pointer rounded-full object-cover hover:opacity-80"
                  title="Click to change profile picture"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={editProfileData.image || defaultProfileImage.src}
                    alt="Default Image"
                    className="mt-4 h-[100px] w-[100px] cursor-pointer rounded-full object-cover hover:opacity-80"
                  />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <input
              type="text"
              placeholder="First Name"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={editProfileData.firstName}
              onChange={(e) =>
                setEditProfileData({
                  ...editProfileData,
                  firstName: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={editProfileData.lastName}
              onChange={(e) =>
                setEditProfileData({
                  ...editProfileData,
                  lastName: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Nickname"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={editProfileData.nickname}
              onChange={(e) =>
                setEditProfileData({
                  ...editProfileData,
                  nickname: e.target.value,
                })
              }
              required
            />
            <input
              type="date"
              placeholder="Birthday"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={editProfileData.birthday}
              onChange={(e) =>
                setEditProfileData({
                  ...editProfileData,
                  birthday: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={editProfileData.phonenumber}
              onChange={handlePhoneNumberChange}
              required
            />
            <input
              type="text"
              placeholder="Address"
              className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                editable ? "" : "pointer-events-none"
              }`}
              value={address}
              onChange={handleLocationChange}
              required
            />
            {session?.user.role === "admin" && (
              <>
                <input
                  type="text"
                  placeholder="Employee ID"
                  className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                    editable ? "" : "pointer-events-none"
                  }`}
                  value={editProfileData.employeeID}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      employeeID: e.target.value,
                    })
                  }
                />
                <select
                  className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                    editable ? "" : "pointer-events-none"
                  }`}
                  value={editProfileData.role}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="lead">Lead</option>
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                </select>
                <input
                  type="text"
                  placeholder="Driver's License"
                  className={`mt-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-400 ${
                    editable ? "" : "pointer-events-none"
                  }`}
                  value={editProfileData.driversLicense}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      driversLicense: e.target.value,
                    })
                  }
                />
                <label className="mt-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      editable ? "" : "pointer-events-none"
                    }`}
                    checked={editProfileData.active || false}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        active: e.target.checked,
                      })
                    }
                    disabled={!editable} // Disable checkbox if not editable
                  />
                  <span>Active</span>
                </label>
              </>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2 w-full rounded-md border border-gray-300 bg-white shadow-md">
                {suggestions.map((suggestion, index) => (
                  <p
                    className="cursor-pointer p-2 text-sm text-gray-800 hover:bg-gray-100"
                    key={index}
                    onClick={() => {
                      setAddress(suggestion.properties.full_address);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion.properties.full_address}
                  </p>
                ))}
              </div>
            )}
            <button
              className={`mt-6 w-full rounded py-2 ${
                disabled
                  ? "cursor-not-allowed bg-orange-500 text-white opacity-50"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              onClick={() => setEditable(!editable)}
              disabled={disabled}
            >
              {editable ? "Cancel Editing" : "Edit Profile"}
            </button>
            {editable && (
              <button
                className={`mt-4 w-full rounded py-2 ${
                  disabled
                    ? "cursor-not-allowed bg-green-500 text-white opacity-50"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                onClick={updateProfile}
                disabled={disabled}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </main>
    )
  );
};

export default EditProfile;
