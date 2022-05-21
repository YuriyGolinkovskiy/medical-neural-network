import {
    Body,
    Controller,
    Get,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NetworkService } from './network.service';

@Controller('network')
export class NetworkController {
    constructor(private readonly networkService: NetworkService) {}

    @Get('trainNetwork')
    getTrainedNetworkModel(): Promise<void> {
        return this.networkService.getTrainedNetworkModel(100, 32, './model');
    }

    @Post('predict')
    @UseInterceptors(FilesInterceptor('file'))
    getPredict(@UploadedFiles() files: Express.Multer.File[]): Promise<void> {
        return this.networkService.getPrediction(files);
    }
}
