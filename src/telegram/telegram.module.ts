import {Module} from '@nestjs/common';
import {AnalyticsSummaryModule} from '../parser/queues/analytics_summary/analytics_summary.module';
import {UserActionModule} from '../user-action/user-action.module';
import {UsersModule} from '../users/users.module';
import {UtilsModule} from '../utils/utils.module';
import {KeyboardService} from './keyboard/keyboard.service';
import {MenuService} from './keyboard/menu.service';
import {RegisterByPhoneSceneService} from './scenes/register/register-by-phone-scene.service';
import {RegisterByTokenSceneService} from './scenes/register/register-by-token-scene.service';
import {AddShopsSceneService} from './scenes/shops/add-shops-scene.service';
import {RemoveShopsSceneService} from './scenes/shops/remove-shops-scene.service';
import {ShopsSceneService} from './scenes/shops/shops-scene.service';
import {OzonSummarySceneService} from './scenes/summary/ozon-summary-scene.service';
import {SummarySceneService} from './scenes/summary/summary-scene.service';
import {WbSummarySceneService} from './scenes/summary/wb-summary-scene.service';
import {TimezoneSceneService} from './scenes/timezone/timezone-scene.service';
import {TelegramSendMessageService} from './telegram-sendMessage.service';
import {TelegramMiddlewareService} from './telegram.middleware';
import {TelegramService} from './telegram.service';
import {TelegramUpdate} from './telegram.update';

@Module({
	imports: [UtilsModule, UsersModule, UserActionModule, AnalyticsSummaryModule],
	providers: [
		MenuService,
		TelegramUpdate,
		TelegramService,
		KeyboardService,
		TelegramMiddlewareService,
		TelegramSendMessageService,
		RegisterByTokenSceneService,
		RegisterByPhoneSceneService,
		ShopsSceneService,
		RemoveShopsSceneService,
		AddShopsSceneService,
		TimezoneSceneService,
		SummarySceneService,
		WbSummarySceneService,
		OzonSummarySceneService,
	],
	exports: [TelegramMiddlewareService, TelegramService],
})
export class TelegramModule {}
