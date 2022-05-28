import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { Role } from '../../roles/schemas/roles.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty({ example: 'admin', description: 'Логин', uniqueItems: true })
    @Prop({ required: true, unique: true })
    login: string;

    @ApiProperty({ example: 'qwerty1234', description: 'Пароль' })
    @Prop({ required: true })
    password: string;

    @ApiProperty({ example: '18', description: 'Возраст', required: false })
    @Prop()
    age: number;

    @Prop({ required: false })
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId;
            ref: 'Role';
        }
    ];
}

export const UserSchema = SchemaFactory.createForClass(User);
