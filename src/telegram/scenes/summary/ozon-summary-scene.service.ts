import {OzonApiKeys} from '@prisma/client';
import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {UsersService} from '../../../users/users.service';
import {ACTIONS, hiddenKeys, SCENES, selectOzonKeys, timeOut} from '../../constants';
import {Shops} from '../../keyboard/keyboard.service';
import {MenuService} from '../../keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../telegram-context';

@Scene(SCENES.OZON_SUMMARY)
export class OzonSummarySceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userServiceRepository: UsersService,
	) {}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		await ctx.scene.leave();
	}

	@SceneEnter()
	async getOzonShops(@Context() ctx: MyContext & CustomMyContext) {
		const {ozonApiKeys} = ctx.session;
		ctx.session.keys = ozonApiKeys;
		if (!ozonApiKeys.length) {
			return this.menuService.getOzonShops(ctx, hiddenKeys);
		}

		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectOzonKeys, Shops.OZON);
	}
	@Action(ACTIONS.BACK)
	async backToMainMenu(@Context() ctx: MyContext & CustomMyContext) {
		await ctx.scene.leave();
		await ctx.scene.enter(SCENES.GET_SUMMARY);
	}
	@Action(new RegExp(ACTIONS.SELECT_SHOP_OZON))
	async selectShop(@Context() ctx: MyContext) {
		const selectedKey = ctx.match.input.split('-');
		const index = ctx.session.keys.findIndex((key) => key.keyId === selectedKey[1]);
		ctx.session.keys[index].selected = !ctx.session.keys[index].selected;
		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectOzonKeys, Shops.OZON);
	}

	@Action(new RegExp(ACTIONS.GET_OZON_SHOPS_SUMMARY))
	async getOzonShopsSummary(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId;
		const user = await this.userServiceRepository.getOzonKeys(userId);
		ctx.session.ozonApiKeys = user?.ozonApiKeys ?? [];
		await ctx.reply('Пожалуйста ожидайте, отчет формируется');
		await this.userServiceRepository.sendOzonSummary(
			userId,
			user?.ozonApiKeys,
			user?.session?.token,
		);
		return ctx.scene.leave();
	}

	@Action(new RegExp(ACTIONS.APPLY_OZON))
	async selectSomeShops(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId;
		const keyIds = ctx.session.keys.filter((key) => key.selected) as OzonApiKeys[];
		if (keyIds.length === 0) {
			await ctx.reply('Выберите пожалуйста магазин');
			await ctx.scene.leave();
			await ctx.scene.enter(SCENES.OZON_SUMMARY);
		} else {
			const session = await this.userServiceRepository.getSession(userId);
			await ctx.reply('Пожалуйста ожидайте, отчет формируется');
			await this.userServiceRepository.sendOzonSummary(userId, keyIds, session?.token);
			return ctx.scene.leave();
		}
	}

	@On('text')
	async getNumbersShops(@Context() ctx: MyContext & CustomMyContext) {
		await ctx.scene.reenter();
	}

	@On('message')
	async check(@Context() ctx: MyContext) {
		await this.menuService.notFoundText(ctx);
	}
}
