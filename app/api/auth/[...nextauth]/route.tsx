// \api\auth\[...nextauth]\route.tsx

import NextAuth from "next-auth";
import { authOptions } from "@/app/libs/authOption";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
