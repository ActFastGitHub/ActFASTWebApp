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
} from "@/app/libs/validations";
import { createProfile, updateProfile } from "@/app/libs/actions";
import { Prisma } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  } else {
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

      const exist = await prisma.user.findUnique({
        where: {
          email: session.user?.email!,
        },
      });

      const nickNameExists = await prisma.profile.findUnique({
        where: {
          nickname: nickname,
        },
      });

      if (!exist) {
        throw {
          code: 400,
          message: "User doesn't exist",
        };
      }

      // Validate the image
      if (image && !validateImage(image)) {
        throw {
          code: 400,
          message: "Invalid image format or type",
        };
      }

      // Validate the last name
      if (!lastName) {
        throw {
          code: 400,
          message: "Please enter your last name",
        };
      } else if (!validateName(lastName)) {
        throw {
          code: 400,
          message:
            "Invalid last name format. It should contain only letters and spaces.",
        };
      }

      // Validate the first name
      if (!firstName) {
        throw {
          code: 400,
          message: "Please enter your first name",
        };
      } else if (!validateName(firstName)) {
        throw {
          code: 400,
          message:
            "Invalid first name format. It should contain only letters and spaces.",
        };
      }

      // Validate the nickname
      if (!nickname) {
        throw {
          code: 400,
          message: "Please enter your nickname",
        };
      } else if (!validateName(nickname)) {
        throw {
          code: 400,
          message:
            "Invalid nickname format. It should contain only letters and spaces.",
        };
      }

      if (nickNameExists) {
        throw {
          code: 400,
          message: `${nickname} is already being used, please choose a unique nickame.`,
        };
      }

      // Validate the birthday
      if (!birthday) {
        throw {
          code: 400,
          message: "Please select or enter your birthday using the calendar",
        };
      } else {
        const today = new Date();
        const selectedDate = new Date(birthday);
        if (selectedDate.getFullYear() < 1900 || selectedDate >= today) {
          throw {
            code: 400,
            message:
              "Invalid birthday. It should be between 1900 and the current date.",
          };
        }
      }

      // Validate the phone number
      if (!phonenumber) {
        throw {
          code: 400,
          message: "Please enter your phone number",
        };
      } else if (!validatePhoneNumber(phonenumber)) {
        throw {
          code: 400,
          message:
            "Invalid phone number format. Please use the format: xxx-xxx-xxxx",
        };
      }

      // Validate the location
      if (!location) {
        throw {
          code: 400,
          message: "Please enter your address",
        };
      }

      // Upload image to Cloudinary
      let imageUrl = "";
      if (image) {
        const cloudinaryResponse = await cloudinary.uploader.upload(image, {
          public_id: `${session.user.email}-profile-image`,
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
          user: {
            connect: {
              email: session.user?.email!,
            },
          },
        },
      });

      return NextResponse.json({
        userProfile,
        status: 200,
      });
    } catch (error: any) {
      const { code = 500, message = "Internal server error" } = error as APIErr;
      return NextResponse.json({
        status: code,
        error: message,
      });
    }
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  } else {
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
      } = body;

      // Validate the image
      if (image && !validateImage(image)) {
        throw {
          code: 400,
          message: "Invalid image format or type",
        };
      }

      // Validate the last name
      if (!lastName) {
        throw {
          code: 400,
          message: "Please enter your last name",
        };
      } else if (!validateName(lastName)) {
        throw {
          code: 400,
          message:
            "Invalid last name format. It should contain only letters and spaces.",
        };
      }

      // Validate the first name
      if (!firstName) {
        throw {
          code: 400,
          message: "Please enter your first name",
        };
      } else if (!validateName(firstName)) {
        throw {
          code: 400,
          message:
            "Invalid first name format. It should contain only letters and spaces.",
        };
      }

      // Validate the nickname
      if (!nickname) {
        throw {
          code: 400,
          message: "Please enter your nickname",
        };
      } else if (!validateName(nickname)) {
        throw {
          code: 400,
          message:
            "Invalid nickname format. It should contain only letters and spaces.",
        };
      }

      // Validate the birthday
      if (!birthday) {
        throw {
          code: 400,
          message: "Please select or enter your birthday using the calendar",
        };
      } else {
        const today = new Date();
        const selectedDate = new Date(birthday);
        if (selectedDate.getFullYear() < 1900 || selectedDate >= today) {
          throw {
            code: 400,
            message:
              "Invalid birthday. It should be between 1900 and the current date.",
          };
        }
      }

      // Validate the phone number
      if (!phonenumber) {
        throw {
          code: 400,
          message: "Please enter your phone number",
        };
      } else if (!validatePhoneNumber(phonenumber)) {
        throw {
          code: 400,
          message:
            "Invalid phone number format. Please use the format: xxx-xxx-xxxx",
        };
      }

      // Validate the location
      if (!location) {
        throw {
          code: 400,
          message: "Please enter your address",
        };
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

      if (image) {
        const cloudinaryResponse = await cloudinary.uploader.upload(image, {
          public_id: `${session.user.email}-profile-image`,
          overwrite: true,
        });
        updateData.image = cloudinaryResponse.secure_url;
      }

      const updatedUserProfile = await updateProfile(id, updateData);

      return NextResponse.json({
        updatedUserProfile,
        status: 200,
      });
    } catch (error: any) {
      const { code = 500, message = "Internal server error" } = error as APIErr;
      return NextResponse.json({
        status: code,
        error: message,
      });
    }
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  } else {
    try {
      const profiles = await prisma.profile.findMany();

      if (!profiles) {
        return NextResponse.json(
          { error: "No profile found" },
          { status: 404 },
        );
      }

      return NextResponse.json(profiles, { status: 200 });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
}
