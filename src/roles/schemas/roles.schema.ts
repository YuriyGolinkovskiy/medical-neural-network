import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type RoleDocument = Role & Document;

@Schema()
export class Role {
    @ApiProperty({ example: 'ADMIN', description: 'Значение роли' })
    @Prop({ required: true, unique: true })
    value: string;

    @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
    @Prop({ required: false })
    description: string;

    @Prop({ required: false })
    users: [
        {
            type: mongoose.Schema.Types.ObjectId;
            ref: 'User';
        }
    ];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
