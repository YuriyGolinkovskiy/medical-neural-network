import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/roles.schema';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>
    ) {}

    async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
        const role = await this.roleModel.create(createRoleDto);
        return role;
    }

    async getRoleByValue(_value: string): Promise<Role> {
        const role = await this.roleModel.findOne({ value: _value });
        return role;
    }

    async findAll(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }

    async removeByValue(_value: string): Promise<Role> {
        const role = await this.roleModel.findOneAndDelete({ value: _value });
        return role;
    }

    async updateByValue(_value: string, roleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.roleModel.findOneAndUpdate(
            { value: _value },
            roleDto,
            { new: true }
        );
        return role;
    }
}
