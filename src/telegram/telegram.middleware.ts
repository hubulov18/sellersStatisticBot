import {Injectable} from '@nestjs/common';
import {UserActionService} from '../user-action/user-action.service';
import {UsersService} from '../users/users.service';
import {MyContext} from './telegram-context';

@Injectable()
export class TelegramMiddlewareService {
	constructor(
		private readonly userServiceRepository: UsersService,
		private readonly userActionRepository: UserActionService,
	) {}

	userAction() {
		return async (ctx: MyContext, next: () => void) => {
			try {
				const callbackQuery = ctx.callbackQuery;
				let userId: number | undefined;
				let action = 'START';

				if (callbackQuery) {
					userId = callbackQuery.from.id;
					action = (callbackQuery as {data: string}).data;
				} else {
					userId = ctx.message?.from.id;
				}

				if (userId) {
					ctx.session.telegramUserId = BigInt(userId);
					await this.userActionRepository.create(action, userId);
				}

				next();
				return;
			} catch (e) {
				next();
				return;
			}
		};
	}

	public subscribeGuard() {
		return async (ctx: MyContext, next: () => void) => {
			try {
				const message = ctx.callbackQuery?.message ?? ctx.message;
				const from = ctx.callbackQuery?.from ?? message?.from;

				if (!message || !from) {
					next();
					return;
				}

				const user = await this.userServiceRepository.findOneById(BigInt(from.id));
				if (!user) {
					const userData = {
						id: from.id,
						isActive: true,
						firstName: from.first_name,
						lastName: from.last_name,
						username: from.username,
						chatId: message.chat.id,
					};

					return await this.userServiceRepository.createUser(userData);
				}

				if (user.isBlocked) {
					return await ctx.reply('Ваш аккаунт заблокирован!');
				}
				next();
				return;
			} catch (e) {
				next();
				return;
			}
		};
	}
}
