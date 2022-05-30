import { ApiProperty } from '@nestjs/swagger';

export class AddRemoveFilesDto {
    @ApiProperty({
        example: 'dataset_name',
        description: 'Наименование датасета',
    })
    readonly datasetName: string;

    @ApiProperty({
        example: 'true',
        description:
            'Сохранить этот набор данных для обучения?(в обратном случае он будет сохранен для тестировани)',
    })
    readonly isTrainData: string;

    @ApiProperty({
        example: 'true',
        description:
            'Это обьект который будет обучаться распознавать сеть целевой обьект',
    })
    readonly isTarget: string;

    @ApiProperty({
        example: '[file1, file2, file3]',
        description: 'Массив с именами файлов для удаления',
    })
    readonly filesName: string[];
}
