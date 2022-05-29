import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { Role } from './schemas/roles.schema';

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RolesService) {}

    @ApiOperation({ summary: 'Получение всех ролей' })
    @ApiResponse({ status: 200, type: [Role] })
    @Get()
    findAll(): Promise<Role[]> {
        return this.roleService.findAll();
    }

    @ApiOperation({ summary: 'Создание роли' })
    @ApiResponse({ status: 201, type: Role })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.roleService.createRole(createRoleDto);
    }

    @ApiOperation({ summary: 'Получение роли по значению' })
    @ApiResponse({ status: 200, type: Role })
    @Get(':value')
    findByValue(@Param('value') value: string): Promise<Role> {
        return this.roleService.getRoleByValue(value);
    }

    @ApiOperation({ summary: 'Изменение роли по значению' })
    @ApiResponse({ status: 200, type: Role })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Put(':value')
    update(
        @Param('value') value: string,
        @Body() updateRoleDto: UpdateRoleDto
    ): Promise<Role> {
        return this.roleService.updateByValue(value, updateRoleDto);
    }

    @ApiOperation({ summary: 'Удаление роли по значению' })
    @ApiResponse({ status: 200, type: Role })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Delete(':value')
    delete(@Param('value') value: string): Promise<Role> {
        return this.roleService.removeByValue(value);
    }
}
