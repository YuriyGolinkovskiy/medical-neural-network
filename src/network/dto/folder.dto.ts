import { ApiProperty } from '@nestjs/swagger';

export class FolderDto {
    @ApiProperty({ example: 'name_of_folder', description: 'Имя папки' })
    readonly folderName: string;
}
