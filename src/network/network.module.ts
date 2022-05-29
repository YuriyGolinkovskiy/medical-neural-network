import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

@Module({
    controllers: [NetworkController],
    providers: [NetworkService],
    imports: [AuthModule],
})
export class NetworkModule {}
