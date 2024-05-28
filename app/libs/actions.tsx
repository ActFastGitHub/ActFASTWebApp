import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import prisma from "@/app/libs/prismadb";

export async function createProfile(data: {
  select?: Prisma.ProfileSelect<DefaultArgs> | null | undefined;
  include?: Prisma.ProfileInclude<DefaultArgs> | null | undefined;
  data:
    | (Prisma.Without<
        Prisma.ProfileCreateInput,
        Prisma.ProfileUncheckedCreateInput
      > &
        Prisma.ProfileUncheckedCreateInput)
    | (Prisma.Without<
        Prisma.ProfileUncheckedCreateInput,
        Prisma.ProfileCreateInput
      > &
        Prisma.ProfileCreateInput);
}) {
  try {
    const userProfile = await prisma.profile.create(data);
    return userProfile;
  } catch (error) {
    throw new Error("Please enter your complete address");
  }
}

export async function updateProfile(
  id: string,
  updateData: Prisma.ProfileUncheckedUpdateInput,
) {
  try {
    await prisma.$transaction([
      prisma.profile.update({
        where: {
          id: id,
        },
        data: updateData,
      }),    
    ]);

    const updatedUserProfile = await prisma.profile.findUnique({
      where: {
        id: id,
      },
    });

    return updatedUserProfile;
  } catch (error) {
    throw new Error("Please enter your complete address");
  }
}

export const handleEnterKeyPress = (
	e: React.KeyboardEvent,
	callback: (e: React.KeyboardEvent) => void,
	disabled: boolean,
	setDisabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
	if (e.key === "Enter" && !disabled) {
		callback(e);

		setDisabled(true);

		setTimeout(() => {
			setDisabled(false);
		}, 2000);
	}
};
