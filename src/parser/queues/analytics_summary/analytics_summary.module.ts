import {BullModule} from '@nestjs/bull';
import {Module} from '@nestjs/common';
import {KeyboardService} from '../../../telegram/keyboard/keyboard.service';
import {TelegramSendMessageService} from '../../../telegram/telegram-sendMessage.service';
import {UsersApiService} from '../../../users/users-api.service';
import {UsersService} from '../../../users/users.service';
import {QUEUES} from '../../../utils/queues';
import {UtilsModule} from '../../../utils/utils.module';
import {AnalyticsSummaryService} from './analytics_summary.service';

@Module({
	imports: [
		UtilsModule,
		BullModule.registerQueue({
			name: QUEUES.ANALYTICS_SUMMARY,
		}),
	],
	providers: [
		UsersService,
		UsersApiService,
		KeyboardService,
		AnalyticsSummaryService,
		TelegramSendMessageService,
	],
	exports: [AnalyticsSummaryService],
})
export class AnalyticsSummaryModule {}
