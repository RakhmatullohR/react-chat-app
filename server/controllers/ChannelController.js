import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (request, response, next) => {
    try {
        const { name, members } = request.body;
        const userId = request.userId;

        // Verify if the admin user exists
        const admin = await User.findById(userId);
        if (!admin) {
            return response.status(400).send('Admin user not found.');
        }

        // Check if all members are valid users
        const validMembers = await User.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return response.status(400).send('Some members are not valid users.');
        }

        // Create and save the new channel
        const newChannel = new Channel({
            name,
            members,
            admin: userId
        });

        await newChannel.save();
        return response.status(201).json({ channel: newChannel });

    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
};

export const getUserChannels = async (request, response, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(request.userId);
        const channels = await Channel.find({ $or: [{ admin: userId }, { members: userId }] }).sort({ updatedAt: -1 });

        return response.status(200).json({ channels });

    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
};
export const getChannelMessages = async (request, response, next) => {
    try {
        const { channelId } = request?.params;
        const channel = await Channel.findById(channelId).populate({
            path: 'messages',
            populate: {
                path: 'sender',
                select: 'firstName lastName email _id image color'
            }
        });
        console.log(channel);
        if (!channel) {
            return response.status(404).send("Channel was not found");
        }

        const messages = channel.messages;
        return response.status(200).json({ messages });

    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal Server Error");
    }
};
