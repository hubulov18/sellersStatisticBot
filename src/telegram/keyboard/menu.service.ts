import {Injectable} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import {Context} from 'telegraf';
import {UsersService} from '../../users/users.service';
import {
	about,
	askPhoneNumber,
	askPhoneText,
	emptyActiveKey,
	emptyKeys,
	enterShopsNumberForHideText,
	getSummaryNowText,
	hasNotAccount,
	incorrectToken,
	mainMenuText,
	notFoundText,
	selectShops,
	specifyHourText,
	specifyTimezoneText,
	startMenuText,
	timeOut,
} from '../constants';
import {MyContext} from '../telegram-context';
import {KeyboardService, Shops} from './keyboard.service';

@Injectable()
export class MenuService {
	constructor(
		private readonly keyboardService: KeyboardService,
		private readonly usersServiceRepository: UsersService,
	) {}

	async startMenu(ctx: MyContext) {
		const userId = ctx.session.telegramUserId;

		const user = await this.usersServiceRepository.findOneById(userId);

		if (!user || !user.isRegistered) {
			/*	await ctx.replyWithPhoto({
				source: fs.createReadStream(path.resolve(__dirname, `../../../public/welcome.jpg`)),
			});
			*/
			await ctx.reply(startMenuText, {parse_mode: 'HTML'});
			await timeOut(1500);
			await ctx.reply(askPhoneText, {
				parse_mode: 'HTML',
				...this.keyboardService.startMenu(false),
			});
		} else {
			/*	await ctx.replyWithPhoto({
				source: fs.createReadStream(
					path.resolve(__dirname, `../../../public/mainMenu.jpg`),
				),
			});
		*/
			const keyboard = this.keyboardService.startMenu(true);
			await this.editOrReplyMiddleware(ctx, mainMenuText, keyboard);
		}
	}

	async hasAccount(ctx: MyContext) {
		await ctx.reply(askPhoneNumber, {
			...this.keyboardService.getPhoneNumber(),
		});
	}

	async hasNotAccount(ctx: MyContext) {
		await ctx.reply(hasNotAccount, {
			parse_mode: 'HTML',
			disable_web_page_preview: true,
		});
	}

	async backtoMenu(ctx: MyContext) {
		const statusRegister = ctx.session.isRegistered;
		const keyboard = this.keyboardService.startMenu(statusRegister);
		return this.editOrReplyMiddleware(ctx, startMenuText, keyboard);
	}

	async selectShops(ctx: MyContext) {
		return ctx.reply(selectShops, {
			parse_mode: 'HTML',
			...this.keyboardService.selectAllShops(),
		});
	}

	async selectShopsV2(ctx: MyContext, text: string, mode: Shops) {
		const keyboard = this.keyboardService.selectShopsButtons(ctx, mode);
		return this.editOrReplyMiddleware(ctx, text, keyboard);
	}

	async getAllInactiveShops(ctx: MyContext, text: string, keysCount: number) {
		/*	await ctx.replyWithPhoto({
			source: fs.createReadStream(
				path.resolve(__dirname, `../../../public/inActiveShops.jpg`),
			),
		});
*/
		const keyboard = this.keyboardService.addShopsButtons(keysCount);
		return this.editOrReplyMiddleware(ctx, text, keyboard);
	}

	async getAllActiveShops(ctx: MyContext, text: string, keysCount: number) {
		/*await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/activeShops.jpg`)),
		});
*/
		const keyboard = this.keyboardService.removeShopsButtons(keysCount);
		return this.editOrReplyMiddleware(ctx, text, keyboard);
	}

	async about(ctx: MyContext) {
		/*	await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/about.jpg`)),
		});
	*/
		const keyboard = this.keyboardService.goMenu();
		await this.editOrReplyMiddleware(ctx, about, keyboard);
	}

	async settings(ctx: MyContext) {
		/*	await ctx.replyWithPhoto({
			source: fs.createReadStream(
				path.resolve(__dirname, `../../../public/settingsAccount.jpg`),
			),
		});
	 */

		await this.editOrReplyMiddleware(
			ctx,
			'Выберите пункт меню',
			this.keyboardService.shopsButtons(),
		);
	}

	async infoShops(ctx: MyContext) {
		await ctx.reply(enterShopsNumberForHideText, {
			parse_mode: 'HTML',
			...this.keyboardService.selectAllShops(),
		});
	}

	async getTimezones(ctx: MyContext) {
		const keyboard = this.keyboardService.getTimezones();
		await this.editOrReplyMiddleware(ctx, specifyTimezoneText, keyboard);
	}

	async updateTime(ctx: MyContext, text: string) {
		/*
		await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/updateTime.jpg`)),
		});
		*/
		const keyboard = this.keyboardService.updateTime();
		await this.editOrReplyMiddleware(ctx, text, keyboard);
	}

	async getMarketplaces(ctx: MyContext) {
		/*		await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/summary.jpg`)),
		});
 */
		const keyboard = this.keyboardService.getMp();
		await this.editOrReplyMiddleware(ctx, getSummaryNowText, keyboard);
	}

	async getWbShops(ctx: MyContext, text: string) {
		await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/summary.jpg`)),
		});
		await ctx.reply(text, {
			...this.keyboardService.getWBShops(),
			parse_mode: 'HTML',
		});
	}

	async getOzonShops(ctx: MyContext, text: string) {
		await ctx.replyWithPhoto({
			source: fs.createReadStream(path.resolve(__dirname, `../../../public/summary.jpg`)),
		});
		await ctx.reply(text, {
			...this.keyboardService.getOzonShops(),
			parse_mode: 'HTML',
		});
	}

	async getHours(ctx: MyContext) {
		const keyboard = this.keyboardService.getHours();
		await this.editOrReplyMiddleware(ctx, specifyHourText, keyboard);
	}

	async incorrectToken(ctx: MyContext) {
		await ctx.reply(incorrectToken, {...this.keyboardService.incorrectToken()});
	}

	async emptyKeys(ctx: MyContext) {
		await ctx.reply(emptyKeys, {...this.keyboardService.emptyKeys()});
	}

	async notFoundText(ctx: MyContext) {
		await ctx.reply(notFoundText);
	}

	async createShopsText(ctx: MyContext, text: string) {
		const keyboard = this.keyboardService.goMenu();
		await this.editOrReplyMiddleware(ctx, text, keyboard);
	}

	async emptyActiveKey(ctx: MyContext) {
		const keyboard = this.keyboardService.goMenu();
		await this.editOrReplyMiddleware(ctx, emptyActiveKey, keyboard);
	}

	public async editOrReplyMiddleware(
		ctx: Context,
		text: string,
		keyboard: {
			reply_markup: any;
		},
	) {
		try {
			return await ctx.editMessageText(text, {
				...keyboard,
				parse_mode: 'HTML',
			});
		} catch {
			return await ctx.reply(text, {
				...keyboard,
				parse_mode: 'HTML',
				disable_web_page_preview: true,
			});
		}
	}
}
