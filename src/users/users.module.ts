import {Module} from '@nestjs/common';
import {AnalyticsSummaryModule} from '../parser/queues/analytics_summary/analytics_summary.module';
import {KeyboardService} from '../telegram/keyboard/keyboard.service';
import {TelegramSendMessageService} from '../telegram/telegram-sendMessage.service';
import {UtilsModule} from '../utils/utils.module';
import {UsersApiService} from './users-api.service';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';

@Module({
	imports: [UtilsModule, AnalyticsSummaryModule],
	providers: [UsersService, UsersApiService, TelegramSendMessageService, KeyboardService],
	exports: [UsersService, UsersApiService],
	controllers: [UsersController],
})
export class UsersModule {}
