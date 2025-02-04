import {Action, On, Start, Update} from 'nestjs-telegraf';
import {ACTIONS, SCENES} from './constants';
import {MyContext} from './telegram-context';
import {TelegramService} from './telegram.service';

@Update()
export class TelegramUpdate {
	constructor(private readonly telegramService: TelegramService) {}

	@Start()
	async startCommand(ctx: MyContext) {
		await this.telegramService.onStart(ctx);
	}

	@Action(ACTIONS.HAS_ACCOUNT)
	async hasAccount(ctx: MyContext) {
		await this.telegramService.hasAccount(ctx);
	}

	@Action(ACTIONS.HAS_NOT_ACCOUNT)
	async hasNotAccount(ctx: MyContext) {
		await this.telegramService.hasNotAccount(ctx);
	}

	@Action(ACTIONS.SHOW_ALL_ACTIVE_SHOPS)
	async getActiveShops(ctx: MyContext) {
		await this.telegramService.getAllActiveShops(ctx);
	}

	@Action(ACTIONS.BACK)
	async back(ctx: MyContext) {
		await this.telegramService.getAllActiveShops(ctx);
	}

	@Action(ACTIONS.SHOW_ALL_INACTIVE_SHOPS)
	async getInactiveShops(ctx: MyContext) {
		await this.telegramService.getAllInactiveShops(ctx);
	}

	@Action(ACTIONS.BACK_TO_TZ)
	async backToTZ(ctx: MyContext) {
		ctx.scene.reenter();
	}
	@Action(ACTIONS.ADD_SHOPS)
	async addShops(ctx: MyContext) {
		await ctx.scene.enter(SCENES.ADD_SHOPS);
	}

	@Action(ACTIONS.REMOVE_SHOPS)
	async removeShops(ctx: MyContext) {
		await ctx.scene.enter(SCENES.REMOVE_SHOPS);
	}

	@Action(ACTIONS.START)
	async backToMenu(ctx: MyContext) {
		await this.telegramService.onStart(ctx);
	}

	@Action(ACTIONS.ABOUT)
	async about(ctx: MyContext) {
		await this.telegramService.about(ctx);
	}

	@Action(ACTIONS.ACCOUNT_SETTINGS)
	async settings(ctx: MyContext) {
		await this.telegramService.settings(ctx);
	}

	@Action(new RegExp(ACTIONS.UPDATE_TIMEZONE))
	async updateTimezone(ctx: MyContext) {
		await ctx.scene.enter(SCENES.TIMEZONE);
	}

	@Action(new RegExp(ACTIONS.UPDATE_TIME))
	async updateTime(ctx: MyContext) {
		await this.telegramService.updateTime(ctx);
	}

	@Action(ACTIONS.GET_SUMMARY)
	async getSummary(ctx: MyContext) {
		await ctx.scene.enter(SCENES.GET_SUMMARY);
	}

	@Action(ACTIONS.IN_WORKS_REVIEWS)
	async inWorksReview(ctx: MyContext) {
		await this.telegramService.inTheWorksReview(ctx);
	}

	@Action(ACTIONS.IN_WORKS_LEFTOVER)
	async inWorksLeftover(ctx: MyContext) {
		await this.telegramService.inTheWorksLeftover(ctx);
	}

	@On('message')
	onMessage(ctx: MyContext) {
		console.log(ctx.message?.chat.id);
	}
}
