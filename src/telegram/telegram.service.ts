import {Injectable} from '@nestjs/common';
import {InjectBot} from 'nestjs-telegraf';
import {Scenes, session, Telegraf} from 'telegraf';
import {UsersService} from '../users/users.service';
import {UtilsService} from '../utils/utils.service';
import {
	getAllActiveShopsText,
	getAllInActiveShopsText,
	hiddenKeys,
	infoTime,
	inTheWorkLeftovers,
	inTheWorkReview,
	monitoringKeysText,
	SCENES,
} from './constants';
import {KeyboardService} from './keyboard/keyboard.service';
import {MenuService} from './keyboard/menu.service';
import {MyContext} from './telegram-context';
import {TelegramMiddlewareService} from './telegram.middleware';

@Injectable()
export class TelegramService {
	stage: Scenes.Stage<MyContext>;

	constructor(
		@InjectBot() private readonly bot: Telegraf<MyContext>,
		private readonly telegramMiddlewareService: TelegramMiddlewareService,
		private readonly menuService: MenuService,
		private readonly userService: UsersService,
		private readonly keyboardService: KeyboardService,
		private readonly utilsService: UtilsService,
	) {
		this.stage = new Scenes.Stage();
		this.bot.use(session());
		this.bot.use(this.stage.middleware());
		this.bot.use(this.telegramMiddlewareService.subscribeGuard());
		this.bot.use(this.telegramMiddlewareService.userAction());
	}

	async launchBot() {
		try {
			await this.bot.telegram.setMyCommands([
				{command: 'start', description: 'Открыть меню'},
			]);

			process.once('SIGINT', () => {
				this.bot.telegram.sendMessage(
					-878221724,
					'Бот шопстат не работает https://t.me/ShopStatRu_bot',
				);
			});

			process.once('SIGTERM', async () => {
				this.bot.telegram.sendMessage(
					-878221724,
					'Бот шопстат не работает https://t.me/ShopStatRu_bot',
				);
			});
		} catch (error) {
			console.log(error);

			this.bot.telegram.sendMessage(
				-878221724,
				'Бот шопстат не работает https://t.me/ShopStatRu_bot',
			);
		}

		this.bot.catch((error) => {
			console.error(undefined, 'Global error has happened, %O', error);
		});
	}

	async onStart(ctx: MyContext) {
		await this.menuService.startMenu(ctx);
	}

	async hasAccount(ctx: MyContext) {
		await ctx.scene.enter(SCENES.REGISTER_BY_PHONE);
	}

	async hasNotAccount(ctx: MyContext) {
		await ctx.scene.enter(SCENES.REGISTER_BY_TOKEN);
	}

	async getAllActiveShops(ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const userKeys = await this.userService.getShopsByStatus(userId, true);
		const keyCount = userKeys.length;
		ctx.session.keys = userKeys;

		if (!userKeys.length) {
			return this.menuService.getAllActiveShops(ctx, monitoringKeysText, keyCount);
		}

		const text = this.utilsService.createShopsText(getAllActiveShopsText, userKeys, true);
		return this.menuService.getAllActiveShops(ctx, text, keyCount);
	}

	async getAllInactiveShops(ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const userKeys = await this.userService.getShopsByStatus(userId, false);
		const keyCount = userKeys.length;
		ctx.session.keys = userKeys;

		if (!userKeys.length) {
			return this.menuService.getAllInactiveShops(ctx, hiddenKeys, keyCount);
		}

		const text = this.utilsService.createShopsText(getAllInActiveShopsText, userKeys, true);
		return this.menuService.getAllInactiveShops(ctx, text, keyCount);
	}

	async about(ctx: MyContext) {
		await this.menuService.about(ctx);
	}

	async settings(ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const userKeys = await this.userService.getShops(userId);

		if (userKeys.length) {
			return this.menuService.settings(ctx);
		}

		return this.menuService.emptyKeys(ctx);
	}

	async updateTime(ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const user = await this.userService.findOneById(userId);

		if (!user) {
			return this.menuService.backtoMenu(ctx);
		}

		const {wbApiKeys, ozonApiKeys, initHour, timezone} = user;
		if (!wbApiKeys.length && !ozonApiKeys.length) {
			return this.menuService.emptyActiveKey(ctx);
		}

		const text = this.utilsService.createTimeText(infoTime, initHour, timezone);
		return this.menuService.updateTime(ctx, text);
	}

	async inTheWorksReview(ctx: MyContext) {
		const keyboard = this.keyboardService.goMenu();
		return this.menuService.editOrReplyMiddleware(ctx, inTheWorkReview, keyboard);
	}

	async inTheWorksLeftover(ctx: MyContext) {
		const keyboard = this.keyboardService.goMenu();
		return this.menuService.editOrReplyMiddleware(ctx, inTheWorkLeftovers, keyboard);
	}
}
