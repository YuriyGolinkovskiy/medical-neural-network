import { ApiProperty } from '@nestjs/swagger';

export class NetworkSettingsDto {
    @ApiProperty({ example: '100', description: 'Количество эпох обучения' })
    readonly epochs: number;

    @ApiProperty({
        example: '32',
        description: 'Размер пакета данных, проходящих обучение за одну эпоху',
    })
    readonly batchSize: number;

    @ApiProperty({
        example: 'path_dataset',
        description: 'Путь к датасету на сервере',
    })
    readonly pathToDataset: string;

    @ApiProperty({ example: 'model', description: 'Имя модели' })
    readonly modelSaveName: string;
}
