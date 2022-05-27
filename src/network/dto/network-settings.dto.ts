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
        example: 'model_test',
        description: 'Путь к тестовому датасету на сервере',
    })
    readonly pathTestData: string;

    @ApiProperty({
        example: 'model_train',
        description: 'Путь к тренировочному датасету на сервере',
    })
    readonly pathTrainData: string;

    @ApiProperty({ example: 'model', description: 'Имя модели' })
    readonly modelSaveName: string;
}
