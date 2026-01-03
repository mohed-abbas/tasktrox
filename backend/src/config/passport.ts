import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { prisma } from './database.js';
import { env } from './env.js';
import { AuthService } from '../services/auth.service.js';
import type { User } from '@prisma/client';

// Use validated environment variable - no fallback (fail-fast on startup)
const JWT_SECRET = env.JWT_SECRET;

// Serialize user ID to session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (email/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValid = await AuthService.verifyPassword(password, user.password);

        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy (for protected routes)
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy (only enabled if credentials are configured)
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  // Construct callback URL: use explicit GOOGLE_CALLBACK_URL or derive from API_URL
  const googleCallbackUrl =
    env.GOOGLE_CALLBACK_URL || `${env.API_URL}/api/v1/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          const avatar = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const { user } = await AuthService.findOrCreateOAuthUser(
            'google',
            profile.id,
            email,
            name,
            avatar
          );

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Apple OAuth Strategy (if configured)
// Note: Apple Sign-In requires additional setup
// You can add passport-apple if needed

export function initializePassport() {
  return passport.initialize();
}

export default passport;
