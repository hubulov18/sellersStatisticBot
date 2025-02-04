import {Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {CustomMyContext, MyContext} from '../../../telegram/telegram-context';
import {UsersApiService} from '../../../users/users-api.service';
import {UsersService} from '../../../users/users.service';
import {SCENES} from '../../constants';
import {MenuService} from '../../keyboard/menu.service';

@Scene(SCENES.REGISTER_BY_TOKEN)
export class RegisterByTokenSceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userApiService: UsersApiService,
		private readonly userServiceRepository: UsersService,
	) {}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}

	@SceneEnter()
	async linkToShopstat(@Context() ctx: MyContext) {
		await this.menuService.hasNotAccount(ctx);
	}

	@On('text')
	async getToken(@Context() ctx: MyContext & CustomMyContext) {
		const {text: token} = ctx.update.message;

		const userId = ctx.session.telegramUserId ?? ctx.update.message.from.id;

		const user = await this.userApiService.checkUserByToken(token);

		if (!user) {
			await this.menuService.incorrectToken(ctx);
			return ctx.scene.leave();
		}

		const {wbApiKeys = [], ozonApiKeys = [], phone = ''} = user;

		if (!wbApiKeys.length && !ozonApiKeys.length) {
			await this.menuService.emptyKeys(ctx);
			return ctx.scene.leave();
		}

		await this.userServiceRepository.addApiKeys(userId, {
			isRegistered: true,
			phone,
			wbApiKeys,
			ozonApiKeys,
			token,
		});

		ctx.session.isRegistered = true;

		await ctx.reply('Токен успешно подключен 🎉');
		return ctx.scene.enter(SCENES.GET_SHOPS);
	}

	@On('message')
	async message(@Context() ctx: MyContext) {
		await ctx.reply('Какой-то странный токен\\');
	}
}
