import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true },
    password: { type: String, require: true },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)