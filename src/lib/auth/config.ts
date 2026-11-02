import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Kun én admin-bruger, seedet via .env — se AGENTS.md/projektplan: ingen
// multi-admin/rolletabel i v1, så vi validerer direkte mod env-variabler i
// stedet for et AdminUser-opslag i databasen.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail" },
        password: { label: "Adgangskode" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminPasswordHash) return null;

        if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return null;

        const valid = await bcrypt.compare(password, adminPasswordHash);
        if (!valid) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginRoute = request.nextUrl.pathname === "/admin/login";

      if (!isAdminRoute || isLoginRoute) return true;
      return isLoggedIn;
    },
  },
};
