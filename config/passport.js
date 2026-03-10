import "../config/env.js";   // ✅ load env FIRST

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 1️⃣ Check if user already linked to Google
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2️⃣ Check if local account exists
        user = await User.findOne({ email });

        if (user) {
          // Link Google account without removing password
          user.googleId = profile.id;

          if (!user.provider) {
            user.provider = "local"; // preserve local identity
          }

          await user.save();
          return done(null, user);
        }

        // 3️⃣ Create brand new Google user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          role: "user",
          provider: "google",
        });

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;