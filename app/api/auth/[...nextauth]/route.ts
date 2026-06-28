import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { supabase } from '../../../../lib/supabase';

const handler = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Attach the user id from the token to session.user.id for compatibility
      (session.user as any).id = token.sub;
      return session;
    },
  },
  events: {
    // Upsert a profile row in Supabase on every successful sign-in
    async signIn({ user }) {
      try {
        await supabase.from('profiles').upsert(
          { id: user.id, email: user.email, role: 'member' },
          { returning: 'minimal' }
        );
      } catch (err) {
        console.error('Failed to upsert profile in Supabase on signIn event:', err);
      }
    },
  },
});

export { handler as GET, handler as POST };