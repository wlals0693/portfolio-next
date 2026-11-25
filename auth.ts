import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models";

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error(
    "AUTH_SECRET를 32자 이상으로 설정해주세요. npm run setup:auth 명령으로 생성할 수 있습니다.",
  );
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        )
          return null;
        const email = credentials.email.trim().toLowerCase();
        if (
          email.length > 254 ||
          !credentials.password ||
          Buffer.byteLength(credentials.password) > 72
        )
          return null;
        await connectDB();
        const user = await UserModel.findOne({ email })
          .select("+passwordHash")
          .lean();
        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.passwordHash))
        )
          return null;
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      // 매 요청에서 DB를 재확인해 권한 변경·계정 삭제가 기존 세션에도 반영됩니다.
      if (!token.sub)
        return { ...session, user: undefined } as unknown as typeof session;
      await connectDB();
      const user = await UserModel.findById(token.sub)
        .select("name email role")
        .lean();
      if (!user)
        return { ...session, user: undefined } as unknown as typeof session;
      session.user = {
        ...session.user,
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      };
      return session;
    },
  },
});
