import {BullModule} from '@nestjs/bull';
import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ScheduleModule} from '@nestjs/schedule';
import {TelegrafModule} from 'nestjs-telegraf';
import {session} from 'telegraf';
import {AnalyticsSummaryModule} from './parser/queues/analytics_summary/analytics_summary.module';
import {SchedulerModule} from './scheduler/scheduler.module';
import {TelegramModule} from './telegram/telegram.module';
import {UserActionModule} from './user-action/user-action.module';
import {UsersModule} from './users/users.module';
import {AppConfigService} from './utils/app-config.service';
import {envValidate} from './utils/env.validation';
import {UtilsModule} from './utils/utils.module';

@Module({
	imports: [
		ConfigModule.forRoot({validate: envValidate}),
		TelegrafModule.forRootAsync({
			imports: [UtilsModule],
			useFactory: (appConfigService: AppConfigService) => ({
				token: appConfigService.BOT_TOKEN,
				middlewares: [session()],
			}),
			inject: [AppConfigService],
		}),
		BullModule.forRootAsync({
			imports: [UtilsModule],
			useFactory: (appConfigService: AppConfigService) => ({
				redis: {
					host: appConfigService.REDIS_HOST,
					port: Number(appConfigService.REDIS_PORT),
					password: appConfigService.REDIS_PASSWORD,
				},
			}),
			inject: [AppConfigService],
		}),
		UtilsModule,
		TelegramModule,
		UserActionModule,
		UsersModule,
		SchedulerModule,
		ScheduleModule.forRoot(),
		AnalyticsSummaryModule,
	],
})
export class AppModule {}
