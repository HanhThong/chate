import { Mode } from 'fs';
import { Schema, model, Model, Document} from 'mongoose';

export const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  }
});

export const MessageSchema = new Schema({
  fromUser: {
    type: String,
    required: true,
  },
  toUser: {
    type: String,
    required: true,
  },
  payload: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
  }
});

export interface User {
  fullName: string;
  userName: string;
  userId: string;
}

export interface Message {
  fromUser: string;
  toUser: string;
  payload: string;
}

export interface UserDocument extends User, Document {
}

export interface MessageDocument extends Message, Document {
}

export interface UserModel extends Model<UserDocument> {
}

export interface MessageModel extends Model<MessageDocument> {
}

export const UserModel = model<UserDocument, UserModel>('User', UserSchema);

export const MessageModel = model<MessageDocument, MessageModel>('Message', MessageSchema);
