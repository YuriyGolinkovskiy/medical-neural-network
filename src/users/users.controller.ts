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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'Получение всех пользователей' })
    @ApiResponse({ status: 200, type: [User] })
    @Get()
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @ApiOperation({ summary: 'Получение пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    findById(@Param('id') id: string): Promise<User> {
        return this.usersService.findById(id);
    }

    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({ status: 201, type: User })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @ApiOperation({ summary: 'Изменение пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @ApiOperation({ summary: 'Удаление пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Delete(':id')
    delete(@Param('id') id: string): Promise<User> {
        return this.usersService.remove(id);
    }
}
