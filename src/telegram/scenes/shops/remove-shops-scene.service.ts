import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {
	ACTIONS,
	enterShopsNumberForHideText,
	SCENES,
	selectShopsV2,
	shopNotTrackedList,
	shopNotTrackedText,
	timeOut,
} from '../../../telegram/constants';
import {MenuService} from '../../../telegram/keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../../telegram/telegram-context';
import {UsersService} from '../../../users/users.service';
//import {UtilsService} from '../../../utils/utils.service';
import {Shops} from '../../keyboard/keyboard.service';

@Scene(SCENES.REMOVE_SHOPS)
export class RemoveShopsSceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userServiceRepository: UsersService, //	private readonly utilsService: UtilsService,
	) {}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}

	@SceneEnter()
	async showInfo(@Context() ctx: MyContext) {
		await this.menuService.selectShopsV2(ctx, enterShopsNumberForHideText, Shops.ALL);
	}

	@Action(new RegExp(ACTIONS.SELECT_SHOP_ALL))
	async selectShop(@Context() ctx: MyContext) {
		const selectedKey = ctx.match.input.split('-');
		const index = ctx.session.keys.findIndex((key) => key.keyId === selectedKey[1]);
		ctx.session.keys[index].selected = !ctx.session.keys[index].selected;

		await timeOut(1500);
		await this.menuService.selectShopsV2(ctx, selectShopsV2, Shops.ALL);
	}

	@Action(ACTIONS.APPLY_ALL)
	async selectSomeShops(@Context() ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		const keyIds = ctx.session.keys.filter((key) => key.selected);

		await this.userServiceRepository.updateObservedById(userId, keyIds, false);
		await this.menuService.createShopsText(ctx, shopNotTrackedList(keyIds));
	}

	@Action(ACTIONS.SELECT_ALL_SHOPS)
	async selectAllShops(@Context() ctx: MyContext) {
		const userId = ctx.session.telegramUserId;
		await this.userServiceRepository.updateObserved(userId, false);
		await this.menuService.createShopsText(ctx, shopNotTrackedText);
		return ctx.scene.leave();
	}

	@On('message')
	async message(@Context() ctx: MyContext & CustomMyContext) {
		await this.menuService.notFoundText(ctx);
		return ctx.scene.reenter();
	}
}
