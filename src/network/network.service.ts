import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { Network } from './network.model';
import { NetworkSettingsDto } from './dto/network-settings.dto';
import { PredictionDto } from './dto/prediction.dto';
import { FolderDto } from './dto/folder.dto';
import { AddRemoveFilesDto } from './dto/add-remove-files.dto';

export interface networkArgs {
    epochs: number;
    batchSize: number;
    validationSplit: number;
}

export interface predictResult {
    [key: string]: number;
}
interface predict {
    className: string;
    probability: number;
}

@Injectable()
export class NetworkService {
    DATASETS_DIR = 'src/dataset';
    MODELS_DIR = 'models';

    trainData = [];
    testData = [];
    network = new Network();

    async getTrainedNetworkModel(
        networkSettingsDto: NetworkSettingsDto
    ): Promise<void> {
        console.log('Loading images...');
        this.trainData = this.loadImages(
            path.join(
                this.DATASETS_DIR,
                networkSettingsDto.pathToDataset,
                'train'
            )
        );
        this.testData = this.loadImages(
            path.join(
                this.DATASETS_DIR,
                networkSettingsDto.pathToDataset,
                'test'
            )
        );
        console.log('Images loaded successfully');

        const { images: trainImages, labels: trainLabels } =
            this.getTrainData();
        console.log('Training Images (shape): ' + trainImages.shape);
        console.log('Training Labels (shape): ' + trainLabels.shape);

        this.network.model.summary();

        const networkArgs: networkArgs = {
            epochs: networkSettingsDto.epochs,
            batchSize: networkSettingsDto.batchSize,
            validationSplit: 0.15,
        };
        await this.network.model.fit(trainImages, trainLabels, networkArgs);
        const { images: testImages, labels: testLabels } = this.getTestData();
        const evalOutput = this.network.model.evaluate(testImages, testLabels);

        console.log(
            `\nEvalution result:\n` +
                ` Loss=${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
                `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}; `
        );
        const modelSavePath = './models/' + networkSettingsDto.modelSaveName;
        await this.network.model.save(`file://${modelSavePath}`);
        console.log(`Saved model to path: ${modelSavePath}`);
        return null;
    }

    async getPrediction(
        files: Express.Multer.File[],
        predictionDto: PredictionDto
    ): Promise<predictResult[]> {
        let loadedModel: tf.LayersModel = await tf.loadLayersModel(
            `file://models/${predictionDto.modelName}/model.json`
        );
        let tensors: tf.Tensor<tf.Rank>[] = [];
        files.forEach((file) => {
            let tensor: tf.Tensor<tf.Rank> = tf.node
                .decodeImage(file.buffer)
                .resizeNearestNeighbor([96, 96])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
            tensors.push(tensor);
        });

        let predictions: predict[][] = [];
        let re = /\[/gi;
        let re1 = /]/gi;
        tensors.forEach((tensor) => {
            let prediction: string[] = loadedModel
                .predict(tensor)
                .toString()
                .split('\n')[1]
                .replace(re, '')
                .replace(re1, '')
                .split(' ')
                .join('')
                .split(',')
                .slice(0, -1);

            let target = this.network.TARGET_CLASSES;
            let top2: predict[] = Array.from(prediction)
                .map(function (p, i) {
                    return {
                        probability: Number(p),
                        className: target[i],
                    };
                })
                .sort(function (a: predict, b: predict) {
                    return b.probability - a.probability;
                })
                .slice(0, 2);
            predictions.push(top2);
        });
        let results: predictResult[] = new Array<predictResult>();
        predictions.forEach((predict: predict[]) => {
            console.log('////////////');
            let result: predictResult = {};
            predict.forEach((element: predict) => {
                result[element.className] = element.probability;
            });
            results.push(result);
            Object.keys(result).forEach((elem) => {
                console.log(`${elem}: ${result[elem]}`);
            });
        });

        return results;
    }

    private loadImages(dataDir: string): (tf.Tensor<tf.Rank>[] | boolean[])[] {
        const images: tf.Tensor<tf.Rank>[] = [];
        const labels: boolean[] = [];
        var files: string[] = fs.readdirSync(dataDir);
        for (let i = 0; i < files.length; i++) {
            var filePath: string = path.join(dataDir, files[i]);
            console.log(files[i]);
            var buffer: Buffer = fs.readFileSync(filePath);
            var imageTensor: tf.Tensor<tf.Rank> = tf.node
                .decodeImage(buffer)
                .resizeNearestNeighbor([96, 96])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
            images.push(imageTensor);

            var hasPneumonia: boolean = files[i]
                .toLowerCase()
                .endsWith('_1.jpg');
            labels.push(hasPneumonia);
        }
        return [images, labels];
    }

    private getTrainData() {
        return {
            images: tf.concat(this.trainData[0]),
            labels: tf
                .oneHot(tf.tensor1d(this.trainData[1], 'int32'), 2)
                .toFloat(),
        };
    }

    private getTestData() {
        return {
            images: tf.concat(this.testData[0]),
            labels: tf
                .oneHot(tf.tensor1d(this.testData[1], 'int32'), 2)
                .toFloat(),
        };
    }

    getModels(): string[] {
        let models: string[] = [];
        fs.readdirSync(this.MODELS_DIR).forEach((file) => {
            models.push(file);
        });
        return models;
    }

    getDatasets(): string[] {
        let datasets: string[] = [];
        fs.readdirSync(this.DATASETS_DIR).forEach((file) => {
            datasets.push(file);
        });
        return datasets;
    }

    createDataset(dto: FolderDto): string {
        let isBusy: boolean = false;
        fs.readdirSync(this.DATASETS_DIR).forEach((file) => {
            if (file === dto.folderName) isBusy = true;
        });
        if (isBusy) {
            throw new HttpException(
                'Такой датасет уже существует',
                HttpStatus.BAD_REQUEST
            );
        }
        fs.mkdir(
            path.join(this.DATASETS_DIR, dto.folderName, 'train'),
            { recursive: true },
            (err) => {
                if (err) throw err;
            }
        );
        fs.mkdir(
            path.join(this.DATASETS_DIR, dto.folderName, 'test'),
            { recursive: true },
            (err) => {
                if (err) throw err;
            }
        );
        return dto.folderName;
    }

    deleteDataset(dto: FolderDto): string {
        let isBusy: boolean = false;
        fs.readdirSync(this.DATASETS_DIR).forEach((file) => {
            if (file === dto.folderName) isBusy = true;
        });

        if (!isBusy) {
            throw new HttpException(
                'Датасета с таким наименование нет',
                HttpStatus.BAD_REQUEST
            );
        }
        fs.rm(
            path.join(this.DATASETS_DIR, dto.folderName),
            { recursive: true },
            (err) => {
                if (err) throw err;
            }
        );
        return dto.folderName;
    }

    deleteModel(dto: FolderDto): string {
        let isBusy: boolean = false;
        fs.readdirSync(this.MODELS_DIR).forEach((file) => {
            if (file === dto.folderName) isBusy = true;
        });

        if (!isBusy) {
            throw new HttpException(
                'Модели с таким наименование нет',
                HttpStatus.BAD_REQUEST
            );
        }
        fs.rm(
            path.join(this.MODELS_DIR, dto.folderName),
            { recursive: true },
            (err) => {
                if (err) throw err;
            }
        );
        return dto.folderName;
    }

    addFiles(dto: AddRemoveFilesDto, files: Express.Multer.File[]) {
        const savePath: string = JSON.parse(dto.isTrainData)
            ? path.join(this.DATASETS_DIR, dto.datasetName, 'train')
            : path.join(this.DATASETS_DIR, dto.datasetName, 'test');
        let isBusy: boolean = false;
        fs.readdirSync(this.DATASETS_DIR).forEach((file) => {
            if (file === dto.datasetName) isBusy = true;
        });
        if (!isBusy) {
            throw new HttpException(
                'Датасета с таким наименование нет',
                HttpStatus.BAD_REQUEST
            );
        }
        let fileNames: string[] = [];
        let counter = 1;
        const filesInDir = fs
            .readdirSync(savePath)
            .sort(function (a: string, b: string) {
                var n = Number(a.split('.')[0].split('_')[0]);
                var j = Number(b.split('.')[0].split('_')[0]);
                return n - j;
            });
        filesInDir.forEach((element) => {
            let n = element.split('.')[0].split('_')[0];
            if (JSON.parse(dto.isTarget)) {
                if (element.toLowerCase().endsWith('_1.jpg')) {
                    if (Number(n) !== counter) {
                        for (counter; counter < Number(n); counter++) {
                            fileNames.push(`${counter}_1.jpg`);
                        }
                    }
                    counter += 1;
                }
            } else {
                if (element.toLowerCase().endsWith('_0.jpg')) {
                    if (Number(n) !== counter) {
                        for (counter; counter < Number(n); counter++) {
                            fileNames.push(`${counter}_0.jpg`);
                        }
                    }
                    counter += 1;
                }
            }
        });
        let results: string[] = [];
        files.forEach((file) => {
            let filepath: string = '';
            if (fileNames.length != 0) {
                filepath = path.join(savePath, fileNames.shift());
            } else if (JSON.parse(dto.isTarget)) {
                filepath = path.join(savePath, counter + '_1.jpg');
                counter += 1;
            } else {
                filepath = path.join(savePath, counter + '_0.jpg');
                counter += 1;
            }
            fs.writeFile(filepath, file.buffer, 'binary', function (err) {
                if (err) {
                    throw err;
                }
            });
            results.push(filepath);
        });

        return results;
    }

    deleteFile(dto: AddRemoveFilesDto) {
        const savePath: string = JSON.parse(dto.isTrainData)
            ? path.join(this.DATASETS_DIR, dto.datasetName, 'train')
            : path.join(this.DATASETS_DIR, dto.datasetName, 'test');
        let results: string[] = [];
        dto.filesName.forEach((fileName) => {
            const filePath = path.join(savePath, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                results.push(fileName);
            }
        });
        return results;
    }
}
