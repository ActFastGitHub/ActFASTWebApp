// app/components/editProfile.tsx

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<LocationFeature[]>([]);

  // For admin changing email
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    setAddress(editProfileData?.location?.address?.fullAddress || "");
    setNewEmail(editProfileData?.userEmail || "");
  }, [isFormVisible, editProfileData]);

  const handleLocationChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    // If you have geocoding for suggestions, do it here
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result?.toString() || "";
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    let formattedValue = value.replace(/\D/g, "");
    if (formattedValue.length > 0) {
      const match = formattedValue.match(/(\d{1,3})(\d{0,3})(\d{0,4})/);
      if (match) {
        formattedValue = [match[1], match[2], match[3]]
          .filter(Boolean)
          .join("-");
      }
    }
    setEditProfileData({ ...editProfileData, phonenumber: formattedValue });
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    const loadingToastId = toast.loading("Updating profile...");

    try {
      const requestBody = {
        id: editProfileData.id,
        lastName: editProfileData.lastName,
        firstName: editProfileData.firstName,
        nickname: editProfileData.nickname,
        birthday: editProfileData.birthday,
        phonenumber: editProfileData.phonenumber,
        employeeID: editProfileData.employeeID,
        role: editProfileData.role,
        driversLicense: editProfileData.driversLicense,
        active: editProfileData.active,
        location: {
          lng: editProfileData?.location?.lng,
          lat: editProfileData?.location?.lat,
          address: {
            fullAddress: address,
            pointOfInterest:
              editProfileData?.location?.address?.pointOfInterest || "",
            city: editProfileData?.location?.address?.city || "",
            country: editProfileData?.location?.address?.country || "",
          },
        },
        image: imageBase64,
        // If admin is changing the user's email
        newEmail: session?.user?.role === "admin" ? newEmail : undefined,
      };

      const response = await axios.patch(`/api/user/profile`, requestBody);

      toast.dismiss(loadingToastId);

      if (response.data.status !== 200) {
        const errorMessage = response.data?.error || "An error occurred";
        toast.error(errorMessage);
        setTimeout(() => setDisabled(false), 1500);
      } else {
        toast.success("Profile successfully updated");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.dismiss(loadingToastId);
      toast.error("An error occurred while updating the profile.");
      setTimeout(() => setDisabled(false), 1500);
    }
  };

  if (!isFormVisible) return null;

  return (
    <main
      className="
        fixed 
        inset-0 
        z-10 
        bg-gray-800 
        bg-opacity-50
        overflow-y-auto
        pt-24
        px-4
      "
    >
      <div
        className="
          relative
          mx-auto
          my-4
          w-full
          max-w-lg
          max-h-[90vh]
          overflow-y-auto
          rounded-lg
          bg-white
          p-6
          shadow-lg
        "
      >
        <img
          src={x.src}
          alt="Close"
          width={20}
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => {
            setIsFormVisible(false);
            setEditable(false);
          }}
        />

        <div className="flex flex-col items-center">
          {/* Profile image selection */}
          <div
            onClick={() => editable && fileInputRef.current?.click()}
            className={editable ? "cursor-pointer" : "pointer-events-none"}
          >
            {imageBase64 ? (
              <img
                src={imageBase64}
                alt="Selected File"
                className="mt-4 h-[100px] w-[100px] rounded-full object-cover hover:opacity-80"
              />
            ) : (
              <img
                src={editProfileData.image || defaultProfileImage.src}
                alt="Default"
                className="mt-4 h-[100px] w-[100px] rounded-full object-cover hover:opacity-80"
              />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* First Name */}
          <input
            type="text"
            placeholder="First Name"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={editProfileData.firstName ?? ""}
            onChange={(e) =>
              setEditProfileData({ ...editProfileData, firstName: e.target.value })
            }
          />

          {/* Last Name */}
          <input
            type="text"
            placeholder="Last Name"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={editProfileData.lastName ?? ""}
            onChange={(e) =>
              setEditProfileData({ ...editProfileData, lastName: e.target.value })
            }
          />

          {/* Nickname */}
          <input
            type="text"
            placeholder="Nickname"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={editProfileData.nickname ?? ""}
            onChange={(e) =>
              setEditProfileData({ ...editProfileData, nickname: e.target.value })
            }
          />

          {/* Birthday */}
          <input
            type="date"
            placeholder="Birthday"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={editProfileData.birthday ?? ""}
            onChange={(e) =>
              setEditProfileData({ ...editProfileData, birthday: e.target.value })
            }
          />

          {/* Phone Number */}
          <input
            type="text"
            placeholder="Phone Number"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={editProfileData.phonenumber ?? ""}
            onChange={handlePhoneNumberChange}
          />

          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            className={`mt-4 w-full rounded-md border px-4 py-2 ${
              editable ? "" : "pointer-events-none"
            }`}
            value={address}
            onChange={handleLocationChange}
          />
          {suggestions.length > 0 && (
            <div className="mt-2 w-full rounded-md border bg-white shadow-md">
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

          {/* Admin-only fields */}
          {session?.user?.role === "admin" && (
            <>
              <input
                type="email"
                placeholder="User Email"
                className={`mt-4 w-full rounded-md border px-4 py-2 ${
                  editable ? "" : "pointer-events-none"
                }`}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={!editable}
              />

              <input
                type="text"
                placeholder="Employee ID"
                className={`mt-4 w-full rounded-md border px-4 py-2 ${
                  editable ? "" : "pointer-events-none"
                }`}
                value={editProfileData.employeeID ?? ""}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    employeeID: e.target.value,
                  })
                }
                disabled={!editable}
              />

              <select
                className={`mt-4 w-full rounded-md border px-4 py-2 ${
                  editable ? "" : "pointer-events-none"
                }`}
                value={editProfileData.role ?? ""}
                onChange={(e) =>
                  setEditProfileData({ ...editProfileData, role: e.target.value })
                }
                disabled={!editable}
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
                className={`mt-4 w-full rounded-md border px-4 py-2 ${
                  editable ? "" : "pointer-events-none"
                }`}
                value={editProfileData.driversLicense ?? ""}
                onChange={(e) =>
                  setEditProfileData({
                    ...editProfileData,
                    driversLicense: e.target.value,
                  })
                }
                disabled={!editable}
              />

              <label className="mt-4 flex items-center space-x-3">
                <input
                  type="checkbox"
                  className={`h-4 w-4 rounded border-gray-300 text-blue-600 ${
                    editable ? "" : "pointer-events-none"
                  }`}
                  checked={editProfileData.active ?? false}
                  onChange={(e) =>
                    setEditProfileData({ ...editProfileData, active: e.target.checked })
                  }
                  disabled={!editable}
                />
                <span>Active</span>
              </label>
            </>
          )}

          {/* Toggle Edit */}
          <button
            className={`
              mt-6 w-full rounded py-2 
              ${
                disabled
                  ? "cursor-not-allowed bg-orange-500 text-white opacity-50"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }
            `}
            onClick={() => setEditable(!editable)}
            disabled={disabled}
          >
            {editable ? "Cancel Editing" : "Edit Profile"}
          </button>

          {/* Save Changes */}
          {editable && (
            <button
              className={`
                mt-4 w-full rounded py-2 
                ${
                  disabled
                    ? "cursor-not-allowed bg-green-500 text-white opacity-50"
                    : "bg-green-500 text-white hover:bg-green-600"
                }
              `}
              onClick={updateProfile}
              disabled={disabled}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditProfile;
