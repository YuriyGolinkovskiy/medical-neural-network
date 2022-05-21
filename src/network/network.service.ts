import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { Network } from './network.model';

@Injectable()
export class NetworkService {
    TRAIN_DIR = 'src/dataset/train_small';
    TEST_DIR = 'src/dataset/test_small';
    MODEL_DIR = 'model/model.json';

    trainData = [];
    testData = [];
    network = new Network();

    async getTrainedNetworkModel(
        epochs: number,
        batchSize: number,
        modelSavePath: string
    ): Promise<void> {
        this.loadData();

        const { images: trainImages, labels: trainLabels } =
            this.getTrainData();
        console.log('Training Images (shape): ' + trainImages.shape);
        console.log('Training Labels (shape): ' + trainLabels.shape);

        this.network.model.summary();

        const validationSplit = 0.15;
        await this.network.model.fit(trainImages, trainLabels, {
            epochs,
            batchSize,
            validationSplit,
        });
        const { images: testImages, labels: testLabels } = this.getTestData();
        const evalOutput = this.network.model.evaluate(testImages, testLabels);

        console.log(
            `\nEvalution result:\n` +
                ` Loss=${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
                `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}; `
        );

        await this.network.model.save(`file://${modelSavePath}`);
        console.log(`Saved model to path: ${modelSavePath}`);
    }

    async getPrediction(files: Express.Multer.File[]): Promise<void> {
        let loadedModel: tf.LayersModel = await tf.loadLayersModel(
            `file://model/model.json`
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

        let predictions = [];
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
            let top2 = Array.from(prediction)
                .map(function (p, i) {
                    return {
                        probability: p,
                        className: target[i],
                    };
                })
                .sort(function (a: any, b: any) {
                    return b.probability - a.probability;
                })
                .slice(0, 2);
            predictions.push(top2);
        });
        predictions.forEach((predict) => {
            console.log('////////////');
            predict.forEach((element) => {
                console.log(`${element.className}: ${element.probability}`);
            });
        });
    }

    private loadImages(dataDir: string): (tf.Tensor<tf.Rank>[] | boolean[])[] {
        const images: tf.Tensor<tf.Rank>[] = [];
        const labels: boolean[] = [];
        var files: string[] = fs.readdirSync(dataDir);
        for (let i = 0; i < files.length; i++) {
            var filePath: string = path.join(dataDir, files[i]);
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

    private loadData() {
        console.log('Loading images...');
        this.trainData = this.loadImages(this.TRAIN_DIR);
        this.testData = this.loadImages(this.TEST_DIR);
        console.log('Images loaded successfully');
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
}
