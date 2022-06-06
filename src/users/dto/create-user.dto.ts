import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'admin', description: 'Логин' })
    readonly login: string;
    @ApiProperty({ example: 'qwerty123', description: 'Пароль' })
    readonly password: string;
    @ApiProperty({
        example: '12345678',
        description: 'Id пользователя в телеграмме',
    })
    readonly telegramId?: number;
}
