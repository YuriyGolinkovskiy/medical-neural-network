import * as tf from '@tensorflow/tfjs-node';
export class Network {
    TARGET_CLASSES = {
        0: 'Normal',
        1: 'Pneumonia',
    };
    model: tf.Sequential;

    private kernel_size = [3, 3];
    private pool_size = [2, 2];
    private first_filters = 32;
    private second_filters = 64;
    private third_filters = 128;
    private dropout_conv = 0.3;
    private dropout_dense = 0.3;

    constructor() {
        this.model = tf.sequential();
        this.modelSetting();
    }
    private modelSetting() {
        this.model.add(
            tf.layers.conv2d({
                inputShape: [96, 96, 3],
                filters: this.first_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(
            tf.layers.conv2d({
                filters: this.first_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        this.model.add(tf.layers.dropout({ rate: this.dropout_conv }));
        ////

        this.model.add(
            tf.layers.conv2d({
                filters: this.second_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(
            tf.layers.conv2d({
                filters: this.second_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(
            tf.layers.conv2d({
                filters: this.second_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        this.model.add(tf.layers.dropout({ rate: this.dropout_conv }));

        ///
        this.model.add(
            tf.layers.conv2d({
                filters: this.third_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(
            tf.layers.conv2d({
                filters: this.third_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(
            tf.layers.conv2d({
                filters: this.third_filters,
                kernelSize: this.kernel_size,
                activation: 'relu',
            })
        );
        this.model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
        this.model.add(tf.layers.dropout({ rate: this.dropout_conv }));
        ////
        this.model.add(tf.layers.flatten());
        this.model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
        this.model.add(tf.layers.dropout({ rate: this.dropout_dense }));
        this.model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

        const optimizer = tf.train.adam(0.0001);
        this.model.compile({
            optimizer: optimizer,
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });
    }
}
