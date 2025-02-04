import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {UsersService} from '../../../users/users.service';
import {ACTIONS, SCENES} from '../../constants';
import {MenuService} from '../../keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../telegram-context';

@Scene(SCENES.GET_SUMMARY)
export class SummarySceneService {
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
	async shops(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId;

		const {wbApiKeys, ozonApiKeys} = await this.userServiceRepository.getUserKeys(userId);

		ctx.session.wbApiKeys = wbApiKeys;
		ctx.session.ozonApiKeys = ozonApiKeys;

		if (wbApiKeys.length && ozonApiKeys.length) await this.menuService.getMarketplaces(ctx);

		if (!wbApiKeys.length && !ozonApiKeys.length) await this.menuService.emptyKeys(ctx);

		if (wbApiKeys.length && !ozonApiKeys.length) await this.getWbShops(ctx);

		if (!wbApiKeys.length && ozonApiKeys.length) await this.getOzonShops(ctx);
	}

	@Action(ACTIONS.BACK)
	async backToMainMenu(@Context() ctx: MyContext & CustomMyContext) {
		await ctx.scene.leave();
		await this.menuService.startMenu(ctx);
	}
	@Action(ACTIONS.GET_OZON_SHOPS)
	async getOzonShops(@Context() ctx: MyContext & CustomMyContext) {
		return ctx.scene.enter(SCENES.OZON_SUMMARY);
	}

	@Action(ACTIONS.GET_WB_SHOPS)
	async getWbShops(@Context() ctx: MyContext & CustomMyContext) {
		return ctx.scene.enter(SCENES.WB_SUMMARY);
	}

	@On('message')
	async check(@Context() ctx: MyContext) {
		return ctx.reply('Выберите из предложенных вариантов');
	}
}
