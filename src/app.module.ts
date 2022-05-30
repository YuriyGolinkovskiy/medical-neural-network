import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { NetworkModule } from './network/network.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        MongooseModule.forRoot(
            `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
        ),
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '..', 'src', 'dataset'),
        }),
        UsersModule,
        NetworkModule,
        RolesModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
