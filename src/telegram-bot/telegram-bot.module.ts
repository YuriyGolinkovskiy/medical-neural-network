import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdate } from './telegram-bot.update';
import { HttpModule } from '@nestjs/axios';

@Module({
    controllers: [],
    providers: [TelegramBotService, TelegramBotUpdate],
    imports: [HttpModule],
})
export class TelegramBotModule {}
