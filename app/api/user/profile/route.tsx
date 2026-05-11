// app/api/user/profile/route.tsx

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { v2 as cloudinary } from "cloudinary";
import { APIErr } from "@/app/libs/interfaces";
import {
  validateName,
  validatePhoneNumber,
  validateImage,
  validateEmail,
} from "@/app/libs/validations";
import { createProfile, updateProfile } from "@/app/libs/actions";
import { Prisma } from "@prisma/client";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { isAdminRole, normalizeRole } from "@/app/libs/roles";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ status, error: message }, { status });
}

async function getActorProfile(email: string) {
  return prisma.profile.findUnique({
    where: { userEmail: email },
    select: {
      id: true,
      nickname: true,
      firstName: true,
      role: true,
      userEmail: true,
    },
  });
}

function normalizeEmail(email?: string | null) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function validateProfileFields(data: {
  lastName?: string;
  firstName?: string;
  nickname?: string;
  birthday?: string;
  phonenumber?: string;
  location?: any;
  image?: string;
}) {
  const {
    lastName,
    firstName,
    nickname,
    birthday,
    phonenumber,
    location,
    image,
  } = data;

  if (image && !validateImage(image)) {
    throw { code: 400, message: "Invalid image format or type" };
  }

  if (!lastName) throw { code: 400, message: "Please enter your last name" };
  if (!validateName(lastName)) {
    throw {
      code: 400,
      message:
        "Invalid last name format. It should contain only letters and spaces.",
    };
  }

  if (!firstName) throw { code: 400, message: "Please enter your first name" };
  if (!validateName(firstName)) {
    throw {
      code: 400,
      message:
        "Invalid first name format. It should contain only letters and spaces.",
    };
  }

  if (!nickname) throw { code: 400, message: "Please enter your nickname" };
  if (!validateName(nickname)) {
    throw {
      code: 400,
      message:
        "Invalid nickname format. It should contain only letters and spaces.",
    };
  }

  if (!birthday) {
    throw {
      code: 400,
      message: "Please select or enter your birthday using the calendar",
    };
  }

  const today = new Date();
  const selectedDate = new Date(birthday);

  if (
    Number.isNaN(selectedDate.getTime()) ||
    selectedDate.getFullYear() < 1900 ||
    selectedDate >= today
  ) {
    throw {
      code: 400,
      message:
        "Invalid birthday. It should be between 1900 and the current date.",
    };
  }

  if (!phonenumber) {
    throw { code: 400, message: "Please enter your phone number" };
  }

  if (!validatePhoneNumber(phonenumber)) {
    throw {
      code: 400,
      message:
        "Invalid phone number format. Please use the format: xxx-xxx-xxxx",
    };
  }

  if (!location?.address?.fullAddress) {
    throw { code: 400, message: "Please enter your address" };
  }
}

// ------------------- POST: Create a Profile -------------------
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized access", 401);
  }

  try {
    const body = await request.json();

    const {
      lastName,
      firstName,
      nickname,
      birthday,
      phonenumber,
      location,
      image,
    } = body;

    validateProfileFields({
      lastName,
      firstName,
      nickname,
      birthday,
      phonenumber,
      location,
      image,
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw { code: 400, message: "User doesn't exist" };
    }

    const existingProfileForUser = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
    });

    if (existingProfileForUser) {
      throw { code: 400, message: "This user already has a profile." };
    }

    const nickNameExists = await prisma.profile.findUnique({
      where: { nickname },
    });

    if (nickNameExists) {
      throw {
        code: 400,
        message: `${nickname} is already being used, please choose a unique nickname.`,
      };
    }

    let imageUrl = "";

    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        public_id: `user-${user.id}-profile-image`,
        overwrite: true,
      });

      imageUrl = cloudinaryResponse.secure_url;
    }

    const userProfile = await createProfile({
      data: {
        lastName,
        firstName,
        nickname,
        birthday,
        phonenumber,
        image: imageUrl,
        location: {
          create: {
            lng: location.lng,
            lat: location.lat,
            address: {
              create: {
                fullAddress: location.address.fullAddress,
                pointOfInterest: location.address.pointOfInterest,
                city: location.address.city,
                country: location.address.country,
              },
            },
          },
        },
        role: "member",
        active: true,
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile.nickname || userProfile.firstName || null,
      actorRole: normalizeRole(userProfile.role),
      action: "CREATE",
      entity: "Profile",
      entityId: userProfile.id,
      summary: `Created profile for ${session.user.email}`,
      changes: {
        createdProfile: {
          id: userProfile.id,
          nickname: userProfile.nickname,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          userEmail: userProfile.userEmail,
          role: userProfile.role,
          active: userProfile.active,
        },
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({ userProfile, status: 200 }, { status: 200 });
  } catch (error: any) {
    const { code = 500, message = "Internal server error" } = error as APIErr;
    return jsonError(message, code);
  }
}

// ------------------- PATCH: Update a Profile -------------------
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized access", 401);
  }

  try {
    const body = await request.json();

    const {
      id,
      lastName,
      firstName,
      nickname,
      birthday,
      phonenumber,
      location,
      image,
      employeeID,
      role,
      driversLicense,
      active,
      newEmail,
    } = body;

    if (!id) {
      throw { code: 400, message: "Profile ID is required" };
    }

    validateProfileFields({
      lastName,
      firstName,
      nickname,
      birthday,
      phonenumber,
      location,
      image,
    });

    const actorProfile = await getActorProfile(session.user.email);
    const actorIsAdmin = isAdminRole(actorProfile?.role);

    const existingProfile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: true,
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!existingProfile || !existingProfile.user) {
      throw { code: 404, message: "Profile not found" };
    }

    const isOwnProfile = existingProfile.userEmail === session.user.email;

    if (!actorIsAdmin && !isOwnProfile) {
      throw { code: 403, message: "You can only update your own profile." };
    }

    const nicknameOwner = await prisma.profile.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (nicknameOwner && nicknameOwner.id !== id) {
      throw {
        code: 400,
        message: `${nickname} is already being used, please choose a unique nickname.`,
      };
    }

    const adminOnlyFieldsWereSent =
      newEmail !== undefined ||
      role !== undefined ||
      active !== undefined ||
      employeeID !== undefined ||
      driversLicense !== undefined;

    if (!actorIsAdmin && adminOnlyFieldsWereSent) {
      throw {
        code: 403,
        message:
          "Only admin users can update role, email, active status, employee ID, or driver's license.",
      };
    }

    const normalizedNewEmail = normalizeEmail(newEmail);

    if (actorIsAdmin && normalizedNewEmail) {
      if (!validateEmail(normalizedNewEmail)) {
        throw { code: 400, message: "Please enter a valid email" };
      }

      const existingEmailUser = await prisma.user.findUnique({
        where: { email: normalizedNewEmail },
      });

      if (
        existingEmailUser &&
        existingEmailUser.id !== existingProfile.user.id
      ) {
        throw {
          code: 400,
          message: "That email is already in use by another user.",
        };
      }

      await prisma.user.update({
        where: { id: existingProfile.user.id },
        data: { email: normalizedNewEmail },
      });

      await prisma.profile.update({
        where: { id },
        data: { userEmail: normalizedNewEmail },
      });
    }

    const updateData: Partial<Prisma.ProfileUpdateInput> = {
      lastName,
      firstName,
      nickname,
      birthday,
      phonenumber,
      location: {
        update: {
          lng: location.lng,
          lat: location.lat,
          address: {
            update: {
              fullAddress: location.address.fullAddress,
              pointOfInterest: location.address.pointOfInterest,
              city: location.address.city,
              country: location.address.country,
            },
          },
        },
      },
    };

    if (actorIsAdmin) {
      updateData.role = role;
      updateData.active = active;
      updateData.employeeID = employeeID;
      updateData.driversLicense = driversLicense;
    }

    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        public_id: `user-${existingProfile.user.id}-profile-image`,
        overwrite: true,
      });

      updateData.image = cloudinaryResponse.secure_url;
    }

    const changes = buildChangeSet(
      {
        lastName: existingProfile.lastName,
        firstName: existingProfile.firstName,
        nickname: existingProfile.nickname,
        birthday: existingProfile.birthday,
        phonenumber: existingProfile.phonenumber,
        image: existingProfile.image,
        employeeID: existingProfile.employeeID,
        role: existingProfile.role,
        driversLicense: existingProfile.driversLicense,
        active: existingProfile.active,
        userEmail: existingProfile.userEmail,
        location: existingProfile.location,
      },
      {
        lastName,
        firstName,
        nickname,
        birthday,
        phonenumber,
        image: image ? "UPDATED_IMAGE" : existingProfile.image,
        employeeID: actorIsAdmin ? employeeID : existingProfile.employeeID,
        role: actorIsAdmin ? role : existingProfile.role,
        driversLicense: actorIsAdmin
          ? driversLicense
          : existingProfile.driversLicense,
        active: actorIsAdmin ? active : existingProfile.active,
        userEmail: normalizedNewEmail || existingProfile.userEmail,
        location,
      },
    );

    const updatedUserProfile = await updateProfile(id, updateData);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: actorProfile?.nickname || actorProfile?.firstName || null,
      actorRole: normalizeRole(actorProfile?.role),
      action: "UPDATE",
      entity: "Profile",
      entityId: id,
      summary: `Updated profile: ${updatedUserProfile?.nickname || id}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { updatedUserProfile, status: 200 },
      { status: 200 },
    );
  } catch (error: any) {
    const { code = 500, message = "Internal server error" } = error as APIErr;
    return jsonError(message, code);
  }
}

// ------------------- GET: All Profiles -------------------
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized access", status: 401 },
      { status: 401 },
    );
  }

  try {
    const actorProfile = await getActorProfile(session.user.email);
    const actorIsAdmin = isAdminRole(actorProfile?.role);

    const profiles = await prisma.profile.findMany({
      where: actorIsAdmin
        ? {}
        : {
            userEmail: session.user.email,
          },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    console.error("Error fetching profiles:", error);

    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}
