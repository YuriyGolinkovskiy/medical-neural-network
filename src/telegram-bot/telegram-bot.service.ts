import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SessionData } from './telegram-bot.update';
import * as FormData from 'form-data';

@Injectable()
export class TelegramBotService {
    constructor(private readonly httpService: HttpService) {}
    private server: string = process.env.SERVER_URL;

    registration(createUserDto: CreateUserDto): Observable<AxiosResponse<any>> {
        return this.httpService.post(this.server + '/auth/registration', {
            login: createUserDto.login,
            password: createUserDto.password,
            telegramId: createUserDto.telegramId,
        });
    }

    login(createUserDto: CreateUserDto): Observable<AxiosResponse<any>> {
        return this.httpService.post(this.server + '/auth/login', {
            login: createUserDto.login,
            password: createUserDto.password,
        });
    }

    getUser(login: string) {
        return this.httpService.get(
            this.server + '/users/getUserByLogin/' + login
        );
    }

    getAllUsers(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.get(this.server + '/users', config);
    }

    getUserByLogin(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.get(
            this.server + '/users/getUserByLogin/' + data.log,
            config
        );
    }

    removeUser(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.delete(
            this.server + '/users/' + data.id,
            config
        );
    }

    addRole(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.post(
            this.server + '/users/role',
            { userId: data.id, value: data.addRole },
            config
        );
    }

    removeRole(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.post(
            this.server + '/users/removeRole',
            { userId: data.id, value: data.addRole },
            config
        );
    }

    getAllRoles() {
        return this.httpService.get(this.server + '/roles');
    }

    createRole(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.post(
            this.server + '/roles',
            { value: data.roleValue, description: data.roleDescription },
            config
        );
    }

    deleteRole(data: SessionData) {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.delete(
            this.server + '/roles/' + data.roleValue,
            config
        );
    }
    //Нейросеть
    getModels(): Observable<AxiosResponse<any>> {
        return this.httpService.get(this.server + '/network/getModels');
    }

    deleteModel(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            data: { folderName: data.modelName },
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.delete(
            this.server + '/network/deleteModel',
            config
        );
    }

    getDatasets(): Observable<AxiosResponse<any>> {
        return this.httpService.get(this.server + '/network/getDatasets');
    }

    createDataset(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.post(
            this.server + '/network/createDataset',
            { folderName: data.datasetName },
            config
        );
    }

    deleteDataset(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            data: { folderName: data.datasetName },
            headers: { Authorization: `Bearer ${data.token}` },
        };
        return this.httpService.delete(
            this.server + '/network/deleteDataset',
            config
        );
    }

    trainNetwork(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            headers: { Authorization: `Bearer ${data.token}` },
        };
        let epochs = 10;
        let batchSize = 32;
        if (Number(data.networkBatchSize)) {
            batchSize = Number(data.networkBatchSize);
        }
        if (Number(data.networkEpochs)) {
            epochs = Number(data.networkEpochs);
        }
        return this.httpService.post(
            this.server + '/network/trainNetwork',
            {
                batchSize: batchSize,
                modelSaveName: data.networkSaveModelName,
                pathToDataset: data.datasetName,
                epochs: epochs,
            },
            config
        );
    }

    getTgFileAsBuffer(url): Observable<AxiosResponse<any>> {
        return this.httpService.get(url, { responseType: 'arraybuffer' });
    }

    addFiles(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
        };

        return this.httpService.post(
            this.server + '/network/addFiles',
            {
                datasetName: data.datasetName,
                isTrainData: data.networkIsTrain,
                isTarget: data.networkIsTarget,
                files: data.networkFiles,
            },
            config
        );
    }

    deleteFiles(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
            data: {
                datasetName: data.datasetName,
                isTrainData: data.networkIsTrain,
                filesName: data.networkFiles,
            },
        };

        return this.httpService.delete(
            this.server + '/network/deleteFiles',
            config
        );
    }

    getStaticImages(data: SessionData): Observable<AxiosResponse<any>> {
        const config = {
            data: {
                datasetName: data.datasetName,
                isTrainData: data.networkIsTrain,
            },
        };

        return this.httpService.get(
            this.server + '/network/getStaticImages',
            config
        );
    }

    getPredict(data: SessionData): Observable<AxiosResponse<any>> {
        return this.httpService.post(this.server + '/network/predict', {
            modelName: data.modelName,
            files: data.networkFiles,
        });
    }
}
