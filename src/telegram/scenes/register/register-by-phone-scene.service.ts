import {Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {UsersApiService} from '../../../users/users-api.service';
import {UsersService} from '../../../users/users.service';
import {canNotFindUserText, SCENES} from '../../constants';
import {MenuService} from '../../keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../telegram-context';

@Scene(SCENES.REGISTER_BY_PHONE)
export class RegisterByPhoneSceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userApiService: UsersApiService,
		private readonly userServiceRepository: UsersService,
	) {}

	@SceneEnter()
	async getPhoneNumber(@Context() ctx: MyContext) {
		await this.menuService.hasAccount(ctx);
	}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}

	@On('contact')
	async checkUser(@Context() ctx: MyContext & CustomMyContext) {
		const userId = ctx.session.telegramUserId ?? ctx.update.message.contact.user_id;
		await ctx.reply('Мы обрабатываем данные 🙂', {
			reply_markup: {remove_keyboard: true},
		});

		const {phone_number} = ctx.update.message.contact;
		const phoneNumber = phone_number.includes('+') ? phone_number : `+${phone_number}`; // телеграм иногда отправляет номер телефона без плюса

		const user = await this.userApiService.checkUserByPhone(phoneNumber);

		if (!user) {
			await ctx.reply(canNotFindUserText, {
				reply_markup: {remove_keyboard: true},
			});

			return ctx.scene.enter(SCENES.REGISTER_BY_TOKEN);
		}

		const {wbApiKeys = [], ozonApiKeys = [], token} = user;

		await this.userServiceRepository.addApiKeys(userId, {
			isRegistered: true,
			phone: phoneNumber,
			wbApiKeys,
			ozonApiKeys,
			token,
		});

		if (!wbApiKeys.length && !ozonApiKeys.length) {
			await this.menuService.emptyKeys(ctx);
			return ctx.scene.leave();
		}

		ctx.session.isRegistered = true;
		await ctx.reply('Проверка номера прошла успешно 🎉');
		return ctx.scene.enter(SCENES.GET_SHOPS);
	}

	@On('message')
	async cancel(@Context() ctx: MyContext) {
		await ctx.reply('Для регистрации нужен доступ к вашему номеру телефону', {
			reply_markup: {remove_keyboard: true},
		});
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}
}
