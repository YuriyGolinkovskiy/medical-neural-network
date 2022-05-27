import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('MedicalNeuralNetworkApi')
        .setDescription('Documentation REST API')
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, document);

    await app.listen(PORT, () => {
        console.log(`Server started on port = ${PORT}`);
    });
}
bootstrap();
