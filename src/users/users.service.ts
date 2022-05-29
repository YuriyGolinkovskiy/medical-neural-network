import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private roleService: RolesService
    ) {}

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findById(id: string): Promise<UserDocument> {
        return await this.userModel.findById(id);
    }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const createdUser = await this.userModel.create(createUserDto);
        const role = await this.roleService.getRoleByValue('USER');
        createdUser.$set('roles', [role.value]);
        // role.users.push(createdUser._id);
        // role.save();
        return createdUser.save();
    }

    async remove(id: string): Promise<UserDocument> {
        return await this.userModel.findByIdAndRemove(id);
    }

    async update(id: string, userDto: UpdateUserDto): Promise<UserDocument> {
        return this.userModel.findByIdAndUpdate(id, userDto, { new: true });
    }

    async getUserByLogin(_login: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({
            login: _login,
        });
        return user;
    }
    async addRole(dto: AddRoleDto): Promise<UserDocument> {
        const user = await this.userModel.findById(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            user.roles.forEach((element) => {
                if (element.toString() === role.value) {
                    throw new HttpException(
                        'У пользователя уже есть такая роль',
                        HttpStatus.BAD_REQUEST
                    );
                }
            });
            await this.userModel.updateOne(
                { _id: user._id },
                { $push: { roles: role.value } }
            );
            return user;
        }
        throw new HttpException(
            'Пользователь или роль не найдены',
            HttpStatus.NOT_FOUND
        );
    }

    async removeRole(dto: AddRoleDto): Promise<UserDocument> {
        const user = await this.userModel.findById(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            var isRole = false;
            user.roles.forEach((element) => {
                if (element.toString() === role.value) {
                    isRole = true;
                }
            });
            if (!isRole) {
                throw new HttpException(
                    'У пользователя нет такой роли',
                    HttpStatus.BAD_REQUEST
                );
            }
            await this.userModel.updateOne(
                { _id: user._id },
                { $pull: { roles: role.value } }
            );
            return user;
        }
        throw new HttpException(
            'Пользователь или роль не найдены',
            HttpStatus.NOT_FOUND
        );
    }
}
