import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByLogin(userDto.login);
        if (candidate) {
            throw new HttpException(
                'Пользователь с таким логином существует',
                HttpStatus.BAD_REQUEST
            );
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.create({
            ...userDto,
            password: hashPassword,
        });
        return this.generateToken(user);
    }

    private async generateToken(user: UserDocument) {
        const payload = { login: user.login, id: user._id, roles: user.roles };
        return {
            token: this.jwtService.sign(payload),
        };
    }

    private async validateUser(userDto: CreateUserDto): Promise<UserDocument> {
        const user = await this.userService.getUserByLogin(userDto.login);
        if (user) {
            const passwordEquals = await bcrypt.compare(
                userDto.password,
                user.password
            );
            if (user && passwordEquals) {
                return user;
            }
        }

        throw new UnauthorizedException({
            message: 'Некорректный логин или пароль',
        });
    }
}
