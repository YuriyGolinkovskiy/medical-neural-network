import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
    @ApiProperty({ example: 'USER', description: 'Наименование роли' })
    readonly value: string;
    @ApiProperty({
        example: '629254495fcebdd8dd518c4c',
        description: 'Ид пользователя(сгенерированный БД монго)',
    })
    readonly userId: string;
}
