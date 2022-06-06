import { ApiProperty } from '@nestjs/swagger';

export class PredictionDto {
    @ApiProperty({ example: 'model', description: 'Имя используемой модели' })
    readonly modelName: string;

    @ApiProperty({
        example: 'fileBuffer',
        description:
            'Необходимо передать картинку. Можно несколько, таких полей',
    })
    readonly files: any;
    readonly file: Buffer;
}
