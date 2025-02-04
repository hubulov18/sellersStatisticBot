import {addHours, startOfToday} from 'date-fns';
import {Action, Command, Context, On, Scene, SceneEnter} from 'nestjs-telegraf';
import {UsersService} from '../../../users/users.service';
import {timezones} from '../../../utils/timezone';
import {UtilsService} from '../../../utils/utils.service';
import {ACTIONS, SCENES, successCreateTimezone} from '../../constants';
import {MenuService} from '../../keyboard/menu.service';
import {CustomMyContext, MyContext} from '../../telegram-context';

@Scene(SCENES.TIMEZONE)
export class TimezoneSceneService {
	constructor(
		private readonly menuService: MenuService,
		private readonly userServiceRepository: UsersService,
		private readonly utilsService: UtilsService,
	) {}

	@Command('start')
	async leaveToMenu(@Context() ctx: MyContext) {
		await this.menuService.startMenu(ctx);
		return ctx.scene.leave();
	}

	@SceneEnter()
	async getTimezones(@Context() ctx: MyContext & CustomMyContext) {
		await this.menuService.getTimezones(ctx);
	}

	@Action(new RegExp(ACTIONS.TIMEZONE))
	async selectTimezone(@Context() ctx: MyContext & CustomMyContext) {
		await this.menuService.getHours(ctx);
		ctx.session.timezone = ctx.match.input;
	}

	@Action(new RegExp(ACTIONS.GET_HOUR))
	async selectHour(@Context() ctx: MyContext & CustomMyContext) {
		const initHour = ctx.match.input.replace(ACTIONS.GET_HOUR, '');
		const timezone = Number(ctx.session.timezone.replace(ACTIONS.TIMEZONE, ''));
		const userId = ctx.session.telegramUserId;
		const keys = await this.userServiceRepository.getShopsByStatus(userId, true);
		const findTimezone = timezones.filter(
			(data) => data.callback_data === ctx.session.timezone,
		)[0].timezone;
		const hour = addHours(startOfToday(), Number(initHour) + timezone).getHours();
		const collectHour = `${initHour}:00`;
		await this.userServiceRepository.updateTime(userId, hour, collectHour, findTimezone);
		const timeText = this.utilsService.createTimeText(
			successCreateTimezone,
			collectHour,
			findTimezone,
		);
		const shopText = this.utilsService.createShopsText(timeText, keys, true);
		await this.menuService.createShopsText(ctx, shopText);
		return ctx.scene.leave();
	}

	@On('message')
	async checkTime(@Context() ctx: MyContext & CustomMyContext) {
		await ctx.reply('Выберите из предложенных вариантов');
	}
}
