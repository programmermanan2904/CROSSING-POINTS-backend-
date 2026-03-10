import "../config/env.js";   // load env first

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

/* ================== BASE URL ================== */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://crossing-points-backend.onrender.com"
    : "http://localhost:5000";

/* ================== GOOGLE STRATEGY ================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        /* ================== 1️⃣ CHECK GOOGLE USER ================== */
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        /* ================== 2️⃣ CHECK EXISTING LOCAL USER ================== */
        user = await User.findOne({ email });

        if (user) {
          user.googleId = profile.id;

          if (!user.provider) {
            user.provider = "local";
          }

          await user.save();
          return done(null, user);
        }

        /* ================== 3️⃣ CREATE NEW USER ================== */
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