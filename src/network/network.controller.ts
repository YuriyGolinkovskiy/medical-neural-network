import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NetworkSettingsDto } from './dto/network-settings.dto';
import { NetworkService, predictResult } from './network.service';
import { PredictionDto } from './dto/prediction.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { FolderDto } from './dto/folder.dto';
import { AddRemoveFilesDto } from './dto/add-remove-files.dto';
@ApiTags('Network')
@Controller('network')
export class NetworkController {
    constructor(private readonly networkService: NetworkService) {}

    @ApiOperation({ summary: 'Тренировать сеть и сохранить ее на сервере' })
    @ApiResponse({ status: 200, type: null })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Post('trainNetwork')
    getTrainedNetworkModel(
        @Body() networkSettingsDto: NetworkSettingsDto
    ): Promise<void> {
        return this.networkService.getTrainedNetworkModel(networkSettingsDto);
    }

    @ApiOperation({ summary: 'Получить предсказание сети' })
    @ApiResponse({ status: 200, type: null })
    @Post('predict')
    @UseInterceptors(FilesInterceptor('file'))
    getPredict(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() predictionDto: PredictionDto
    ): Promise<predictResult[]> {
        return this.networkService.getPrediction(files, predictionDto);
    }

    @ApiOperation({ summary: 'Получить доступные и обученные модели сетей' })
    @ApiResponse({ status: 200 })
    @Get('getModels')
    getModels(): string[] {
        return this.networkService.getModels();
    }

    @ApiOperation({ summary: 'Получить доступные датасеты' })
    @ApiResponse({ status: 200 })
    @Get('getDatasets')
    getDatasets(): string[] {
        return this.networkService.getDatasets();
    }

    @ApiOperation({ summary: 'Создать новый датасет' })
    @ApiResponse({ status: 201 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Post('createDataset')
    createDataset(@Body() dto: FolderDto): string {
        return this.networkService.createDataset(dto);
    }

    @ApiOperation({ summary: 'Удалить датасет' })
    @ApiResponse({ status: 200 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Delete('deleteDataset')
    deleteDataset(@Body() dto: FolderDto): string {
        return this.networkService.deleteDataset(dto);
    }

    @ApiOperation({ summary: 'Удалить модель' })
    @ApiResponse({ status: 200 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Delete('deleteModel')
    deleteModel(@Body() dto: FolderDto): string {
        return this.networkService.deleteModel(dto);
    }

    @ApiOperation({ summary: 'Добавить файлы в датасет' })
    @ApiResponse({ status: 201 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @UseInterceptors(FilesInterceptor('file'))
    @Post('addFiles')
    addFiles(
        @Body() dto: AddRemoveFilesDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        return this.networkService.addFiles(dto, files);
    }

    @ApiOperation({ summary: 'Удалить файлы из датасета' })
    @ApiResponse({ status: 200 })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Delete('deleteFiles')
    deleteFile(@Body() dto: AddRemoveFilesDto) {
        return this.networkService.deleteFile(dto);
    }

    @ApiOperation({ summary: 'Получить статические изображения' })
    @ApiResponse({ status: 200 })
    @Get('getStaticImages')
    getStaticImages(@Body() dto: AddRemoveFilesDto) {
        return this.networkService.getStaticImages(dto);
    }
}
