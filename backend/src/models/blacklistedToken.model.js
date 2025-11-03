import mongoose from "mongoose";

const blacklistToken = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
})

blacklistToken.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const blacklistTokenModel = mongoose.model("BlacklistedToken", blacklistToken);

export default blacklistTokenModel