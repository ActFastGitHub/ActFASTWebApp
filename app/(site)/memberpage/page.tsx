"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { UserProps } from "@/app/libs/interfaces"; // Ensure to import your Profile model interface
import email from "@/app/images/email.svg";
import phone from "@/app/images/phone.svg";
import bday from "@/app/images/bday.svg";
import loc from "@/app/images/location.svg";
import EditProfile from "@/app/components/editProfile";
import defaultProfileImage from "@/app/images/blank-profile.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";

const ViewAllProfiles = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Partial<UserProps>[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<UserProps>>(
    {},
  );
  const [disabled, setDisabled] = useState(false);
  const [editable, setEditable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (session?.user.role !== "admin") {
        setProfiles(data.filter((profile: UserProps) => profile.active));
      } else {
        setProfiles(data);
      }
    };

    if (session?.user.email) fetchProfiles();
  }, [session?.user.email]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
    if (session?.user.isNewUser) {
      router.push("/create-profile");
    }
    setIsMounted(true);
  }, [session, status, router]);

  const handleEditProfileClick = (profile: Partial<UserProps>) => {
    setEditProfileData(profile);
    setIsFormVisible(true);
  };

  const activeEmployeeCount = profiles.filter(
    (profile) => profile.active,
  ).length;

  return (
    <div className={`relative min-h-screen bg-gray-100`}>
      <Navbar />
      <div className={`p-6 pt-24 ${isFormVisible ? "blur-sm" : ""}`}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">View All Profiles</h1>
          <span className="text-xl font-semibold">
            Active Employees: {activeEmployeeCount}
          </span>
        </div>
        {profiles.length > 0 ? (
          <Swiper
            effect="flip"
            grabCursor={true}
            pagination={false}
            navigation={false}
            modules={[EffectFlip, Pagination, Navigation]}
            className="mySwiper mx-auto w-full max-w-lg"
          >
            {profiles.map((profile) => (
              <SwiperSlide key={profile?.id}>
                <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                  <div className="flex flex-col items-center">
                    <img
                      src={profile?.image || defaultProfileImage.src}
                      alt=""
                      className="mt-[-50px] h-[100px] w-[100px] rounded-full object-cover shadow-md"
                    />
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold">
                        {profile?.firstName} {profile?.lastName}
                      </div>
                      <p className="text-gray-600">{profile?.nickname}</p>
                    </div>
                    <div className="mt-6 w-full space-y-4">
                      <p className="flex items-center text-lg">
                        <img src={email.src} alt="Email" className="mr-2 w-6" />
                        {profile?.userEmail}
                      </p>
                      <p className="flex items-center text-lg">
                        <img
                          src={bday.src}
                          alt="Birthday"
                          className="mr-2 w-6"
                        />
                        {profile?.birthday}
                      </p>
                      <p className="flex items-center text-lg">
                        <img src={phone.src} alt="Phone" className="mr-2 w-6" />
                        {profile?.phonenumber}
                      </p>
                      <p className="flex items-center text-lg">
                        <img
                          src={loc.src}
                          alt="Location"
                          className="mr-2 w-6"
                        />
                        {profile?.location?.address.fullAddress}
                      </p>
                      {session?.user.role === "admin" && (
                        <>
                          <p className="text-lg">
                            <span className="font-semibold">Status: </span>
                            {profile?.active ? "Active" : "Inactive"}
                          </p>
                          <p className="text-lg">
                            <span className="font-semibold">Role: </span>
                            {profile?.role}
                          </p>
                        </>
                      )}
                    </div>
                    {session?.user.role === "admin" && (
                      <button
                        className="mt-6 w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600"
                        onClick={() => handleEditProfileClick(profile)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>No profiles found.</p>
        )}
      </div>
      {isFormVisible && editProfileData && (
        <EditProfile
          isFormVisible={isFormVisible}
          setIsFormVisible={setIsFormVisible}
          disabled={disabled}
          editProfileData={editProfileData}
          setEditProfileData={setEditProfileData}
          editable={editable}
          setEditable={setEditable}
          setDisabled={setDisabled}
        />
      )}
    </div>
  );
};

export default ViewAllProfiles;
