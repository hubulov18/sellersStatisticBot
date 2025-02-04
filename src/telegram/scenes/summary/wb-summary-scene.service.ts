import {WbApiKeys} from '@prisma/client';
import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {UsersService} from '../../../users/users.service';
import {ACTIONS, hiddenKeys, SCENES, selectWbKeys, timeOut} from '../../constants';
import {Shops} from '../../keyboard/keyboard.service';
import {MenuService} from '../../keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../telegram-context';

@Scene(SCENES.WB_SUMMARY)
export class WbSummarySceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userServiceRepository: UsersService,
	) {}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}

	@SceneEnter()
	async getWbShops(@Context() ctx: MyContext & CustomMyContext) {
		const {wbApiKeys} = ctx.session;
		if (!wbApiKeys.length) {
			return this.menuService.getWbShops(ctx, hiddenKeys);
		}

		ctx.session.keys = wbApiKeys;
		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectWbKeys, Shops.WB);
	}

	@Action(ACTIONS.BACK)
	async backToMainMenu(@Context() ctx: MyContext & CustomMyContext) {
		await ctx.scene.leave();
		await ctx.scene.enter(SCENES.GET_SUMMARY);
	}

	@Action(new RegExp(ACTIONS.SELECT_SHOP_WB))
	async selectShop(@Context() ctx: MyContext) {
		const selectedKey = ctx.match.input.split('-');
		const index = ctx.session.keys.findIndex((key) => key.keyId === selectedKey[1]);
		ctx.session.keys[index].selected = !ctx.session.keys[index].selected;
		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectWbKeys, Shops.WB);
	}

	@Action(new RegExp(ACTIONS.APPLY_WB))
	async selectSomeWbShops(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId;
		const keyIds = ctx.session.keys.filter((key) => key.selected);
		if (keyIds.length === 0) {
			await ctx.reply('Выберите пожалуйста магазин');
			await ctx.scene.leave();
			await ctx.scene.enter(SCENES.WB_SUMMARY);
		} else {
			const session = await this.userServiceRepository.getSession(userId);
			await ctx.reply('Пожалуйста ожидайте, отчет формируется');
			await this.userServiceRepository.sendWbSummary(
				userId,
				keyIds as WbApiKeys[],
				session?.token,
			);
			return ctx.scene.leave();
		}
	}

	@Action(new RegExp(ACTIONS.SELECT_ALL_SHOPS_WB))
	async getWbShopsSummary(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId;
		const user = await this.userServiceRepository.getWbKeys(userId);
		ctx.session.wbApiKeys = user?.wbApiKeys ?? [];
		await ctx.reply('Пожалуйста ожидайте, отчет формируется');
		await this.userServiceRepository.sendWbSummary(
			userId,
			user?.wbApiKeys,
			user?.session?.token,
		);
		return ctx.scene.leave();
	}

	@On('text')
	async getNumbersShops(@Context() ctx: MyContext & CustomMyContext) {
		return ctx.scene.reenter();
	}

	@On('message')
	async check(@Context() ctx: MyContext) {
		await this.menuService.notFoundText(ctx);
	}
}
