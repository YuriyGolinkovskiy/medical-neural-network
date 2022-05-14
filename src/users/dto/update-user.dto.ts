import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example: 'admin', description: 'Логин' })
    readonly login: string;
    @ApiProperty({ example: 'qwerty1234', description: 'Пароль' })
    readonly password: string;
}
