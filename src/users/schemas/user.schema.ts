import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty({ example: 'admin', description: 'Логин' })
    @Prop({ required: true })
    login: string;

    @ApiProperty({ example: 'qwerty1234', description: 'Пароль' })
    @Prop({ required: true })
    password: string;

    @ApiProperty({ example: '18', description: 'Возраст', required: false })
    @Prop()
    age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
