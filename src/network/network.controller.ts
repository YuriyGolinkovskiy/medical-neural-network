import {
    Body,
    Controller,
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
        //const path = './' + networkSettingsDto.modelSaveName;
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
}
