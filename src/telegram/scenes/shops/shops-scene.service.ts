import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {ACTIONS, SCENES, selectShopsV2, timeOut} from '../../../telegram/constants';
import {MenuService} from '../../../telegram/keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../../telegram/telegram-context';
import {UsersService} from '../../../users/users.service';
import {Shops} from '../../keyboard/keyboard.service';

@Scene(SCENES.GET_SHOPS)
export class ShopsSceneService {
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
	async showAllShops(@Context() ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		ctx.session.keys = await this.userServiceRepository.getShopsByStatus(userId, false);
		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectShopsV2, Shops.ALL);
	}

	@Action(ACTIONS.SELECT_ALL_SHOPS)
	async selectAllShops(@Context() ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		await this.userServiceRepository.updateObserved(userId);
		return ctx.scene.enter(SCENES.TIMEZONE);
	}

	@Action(ACTIONS.APPLY_ALL)
	async selectSomeShops(@Context() ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const keyIds = ctx.session.keys.filter((key) => key.selected);
		await this.userServiceRepository.updateObservedById(userId, keyIds);
		return ctx.scene.enter(SCENES.TIMEZONE);
	}
	@Action(new RegExp(ACTIONS.SELECT_SHOP_ALL))
	async selectShop(@Context() ctx: MyContext) {
		const selectedKey = ctx.match.input.split('-');
		const index = ctx.session.keys.findIndex((key) => key.keyId === selectedKey[1]);
		ctx.session.keys[index].selected = !ctx.session.keys[index].selected;

		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectShopsV2, Shops.ALL);
	}

	@On('text')
	async test(@Context() ctx: MyContext & CustomMyContext) {
		return ctx.scene.reenter();
	}

	@On('message')
	async message(@Context() ctx: MyContext & CustomMyContext) {
		await this.menuService.notFoundText(ctx);
		return ctx.scene.reenter();
	}
}
