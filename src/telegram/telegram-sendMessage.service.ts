import {Injectable} from '@nestjs/common';
import {InjectBot} from 'nestjs-telegraf';
import {Telegraf} from 'telegraf';
import {PrismaService} from '../utils/prisma.service';
import {TELEGRAM_ERRORS, timeOut} from './constants';
import {KeyboardService} from './keyboard/keyboard.service';
import {MyContext} from './telegram-context';

@Injectable({})
export class TelegramSendMessageService {
	constructor(
		@InjectBot() private readonly bot: Telegraf<MyContext>,
		private readonly prisma: PrismaService,
		private readonly keyboardService: KeyboardService,
	) {}

	async sendMessage(message: string, chatId: number) {
		await this.bot.telegram.sendMessage(chatId, message);
	}

	async sendSummary(chatId: bigint, message: string) {
		try {
			const keyboards = this.keyboardService.goMenu();

			await timeOut(2000);
			await this.bot.telegram.sendMessage(chatId.toString(), message, {
				...keyboards,
				parse_mode: 'HTML',
			});
		} catch (error) {
			const {message} = error as Error;
			if (message.includes(TELEGRAM_ERRORS.USER_BLOCKED)) {
				await this.prisma.telegramUser.update({
					where: {id: chatId},
					data: {isActive: false},
				});
			}
		}
	}
}
