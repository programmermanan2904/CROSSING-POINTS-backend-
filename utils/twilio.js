import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTP = async (phone) => {
  try {
    const response = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return response;
  } catch (error) {
    console.error("TWILIO SEND OTP ERROR:", error.message);
    throw new Error("Failed to send OTP");
  }
};

export const verifyOTP = async (phone, code) => {
  try {
    const response = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code: code,
      });

    return response;
  } catch (error) {
    console.error("TWILIO VERIFY OTP ERROR:", error.message);
    throw new Error("Failed to verify OTP");
  }
};