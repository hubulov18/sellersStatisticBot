import {forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {OzonApiKeys, Prisma, WbApiKeys} from '@prisma/client';
import {InjectBot} from 'nestjs-telegraf';
import {Telegraf} from 'telegraf';
import {AnalyticsSummaryService} from '../parser/queues/analytics_summary/analytics_summary.service';
import {
	addNewApiKey,
	analyticsSummary,
	badRequestText,
	Errors,
	getAnalyticsSummary,
	numbers,
	removeApiKey,
	subscriptionWarningText,
} from '../telegram/constants';
import {MyContext} from '../telegram/telegram-context';
import {TelegramSendMessageService} from '../telegram/telegram-sendMessage.service';
import {ITodaySummary, ITodaySummaryAllKeys, MarketplaceName} from '../types';
import {PrismaService} from '../utils/prisma.service';
import {UtilsService} from '../utils/utils.service';
import {UsersKeyDto} from './dto/users-key.dto';
import {UsersApiService} from './users-api.service';
import {IUserApiKey, IUserCreate} from './users.interface';

type CreateTelegramUserData = Pick<
	Prisma.TelegramUserCreateInput,
	'id' | 'isActive' | 'firstName' | 'lastName' | 'username' | 'chatId'
>;

@Injectable()
export class UsersService {
	update = this.prisma.telegramUser.update;
	findFirst = this.prisma.telegramUser.findFirst;
	findUnique = this.prisma.telegramUser.findUnique;

	constructor(
		@InjectBot() private readonly bot: Telegraf<MyContext>,
		private readonly prisma: PrismaService,
		private readonly utilsService: UtilsService,
		private readonly userApiService: UsersApiService,
		@Inject(forwardRef(() => AnalyticsSummaryService))
		private readonly analyticsSummaryService: AnalyticsSummaryService,
		private readonly telegramSendMessageService: TelegramSendMessageService,
	) {}

	async createAnalyticsSummaryJob(ozonKeys: OzonApiKeys[], wbKeys: WbApiKeys[], id: string) {
		await this.analyticsSummaryService.createAnalyticsSummaryJob(ozonKeys, wbKeys, id);
	}

	async getTime(id: bigint) {
		return this.findFirst({
			where: {
				id,
			},
			select: {
				initHour: true,
				timezone: true,
			},
		});
	}

	async setUserStatus(id: bigint, isActive: boolean) {
		return this.update({
			where: {
				id,
			},
			data: {
				isActive,
				unsubscribedAt: isActive ? null : new Date(),
			},
		});
	}

	async findOneById(id: bigint) {
		return this.findFirst({
			where: {id},
			include: {
				wbApiKeys: {
					where: {
						isObserved: true,
					},
				},
				ozonApiKeys: {
					where: {
						isObserved: true,
					},
				},
			},
		});
	}

	async createUser(data: CreateTelegramUserData) {
		return this.prisma.telegramUser.create({data});
	}

	async addApiKeys(id: bigint, data: IUserCreate) {
		const session = await this.prisma.sessions.findUnique({
			where: {
				telegramUserId: id,
			},
		});

		if (!session) {
			await this.prisma.sessions.create({
				data: {
					token: data.token,
					telegramUserId: id,
				},
			});
		}

		return this.update({
			where: {id},
			data: {
				wbApiKeys: {
					createMany: {
						data: data.wbApiKeys.map((key) => ({
							keyId: key.keyId,
							name: key.name,
						})),
					},
				},
				ozonApiKeys: {
					createMany: {
						data: data.ozonApiKeys.map((key) => ({
							keyId: key.keyId,
							name: key.name,
						})),
					},
				},
				isRegistered: data.isRegistered,
				phone: data.phone,
			},
		});
	}

	async getShops(id: bigint) {
		const userWbKeys = await this.prisma.wbApiKeys.findMany({
			where: {telegramUserId: id},
			orderBy: {id: 'asc'},
		});

		const userOzonKeys = await this.prisma.ozonApiKeys.findMany({
			where: {telegramUserId: id},
			orderBy: {id: 'asc'},
		});

		const keys = [...userWbKeys, ...userOzonKeys];

		return keys;
	}

	async getOzonKeys(id: bigint) {
		const user = await this.findUnique({
			where: {id},
			include: {
				ozonApiKeys: true,
				session: true,
			},
		});

		return user;
	}

	async getWbKeys(id: bigint) {
		const user = await this.findUnique({
			where: {id},
			include: {
				wbApiKeys: true,
				session: true,
			},
		});

		return user;
	}

	async getShopsByStatus(id: bigint, active: boolean) {
		const userWbKeys = await this.prisma.wbApiKeys.findMany({
			where: {telegramUserId: id, isObserved: active},
			orderBy: {id: 'asc'},
		});

		const userOzonKeys = await this.prisma.ozonApiKeys.findMany({
			where: {telegramUserId: id, isObserved: active},
			orderBy: {id: 'asc'},
		});

		return [...userWbKeys, ...userOzonKeys];
	}

	async getShopsByStatusSeparate(id: bigint, active: boolean) {
		const userWbKeys = await this.prisma.wbApiKeys.findMany({
			where: {telegramUserId: id, isObserved: active},
			orderBy: {id: 'asc'},
		});

		const userOzonKeys = await this.prisma.ozonApiKeys.findMany({
			where: {telegramUserId: id, isObserved: active},
			orderBy: {id: 'asc'},
		});

		return {ozonkeys: userOzonKeys, wbKeys: userWbKeys};
	}

	async updateObserved(id: bigint, status = true) {
		await this.prisma.wbApiKeys.updateMany({
			where: {telegramUserId: id},
			data: {isObserved: status},
		});

		await this.prisma.ozonApiKeys.updateMany({
			where: {telegramUserId: id},
			data: {isObserved: status},
		});
	}

	async updateObservedById(id: bigint, keys: IUserApiKey[], status = true) {
		for (const key of keys) {
			await this.prisma.wbApiKeys.updateMany({
				where: {
					keyId: key.keyId,
					telegramUserId: id,
				},
				data: {
					isObserved: status,
				},
			});

			await this.prisma.ozonApiKeys.updateMany({
				where: {
					keyId: key.keyId,
					telegramUserId: id,
				},
				data: {
					isObserved: status,
				},
			});
		}
	}

	async updateTime(id: bigint, hour: number, initHour: string, timezone: string) {
		await this.update({
			where: {
				id,
			},
			data: {
				showTime: hour,
				initHour,
				timezone,
			},
		});
	}

	async getUserKeys(id: bigint) {
		const userKeys = await this.findUnique({
			where: {id},
			select: {wbApiKeys: true, ozonApiKeys: true},
		});

		if (!userKeys) {
			throw new Error('Не получиось найти ключей');
		}
		return userKeys;
	}

	async getUsersKeysByHour(hour: number) {
		return this.prisma.telegramUser.findMany({
			where: {showTime: hour, isActive: true},
			select: {
				id: true,
				wbApiKeys: {
					where: {
						isObserved: true,
					},
				},
				ozonApiKeys: {
					where: {
						isObserved: true,
					},
				},
				session: {
					select: {
						token: true,
					},
				},
			},
		});
	}

	async getSession(telegramUserId: bigint) {
		return this.prisma.sessions.findUnique({
			where: {
				telegramUserId,
			},
			select: {
				token: true,
			},
		});
	}

	async addOzonApiKey(data: UsersKeyDto) {
		const {keyId, name, token} = data;
		try {
			const user = await this.getUserByToken(token);

			await this.update({
				where: {
					id: user.id,
				},
				data: {
					ozonApiKeys: {
						create: {
							keyId,
							name,
							isObserved: true,
						},
					},
				},
			});

			const msg = this.utilsService.createApiKeyText(
				addNewApiKey,
				MarketplaceName.OZON,
				name,
			);
			await this.bot.telegram.sendMessage(String(user.id), msg);

			return true;
		} catch (error) {
			const msg = (error as Error).message;
			console.log(keyId, token, msg);

			return false;
		}
	}

	async addWbApiKey(data: UsersKeyDto) {
		const {keyId, name, token} = data;
		try {
			const user = await this.getUserByToken(token);

			await this.update({
				where: {
					id: user.id,
				},
				data: {
					wbApiKeys: {
						create: {
							keyId,
							name,
							isObserved: true,
						},
					},
				},
			});

			const msg = this.utilsService.createApiKeyText(addNewApiKey, MarketplaceName.WB, name);
			await this.bot.telegram.sendMessage(String(user.id), msg);

			return true;
		} catch (error) {
			const msg = (error as Error).message;
			console.log(keyId, token, msg);

			return false;
		}
	}

	async removeOzonApiKey(data: Pick<UsersKeyDto, 'keyId' | 'token'>) {
		const {keyId, token} = data;
		try {
			const user = await this.getUserByToken(token);

			const key = user.ozonApiKeys.find((data) => data.keyId === keyId);

			if (!key) {
				throw new NotFoundException(`${keyId} key not found!`);
			}

			await this.update({
				where: {
					id: user.id,
				},
				data: {
					ozonApiKeys: {
						delete: {
							id: key.id,
						},
					},
				},
			});

			const msg = this.utilsService.createApiKeyText(
				removeApiKey,
				MarketplaceName.OZON,
				key.name,
			);

			await this.bot.telegram.sendMessage(String(user.id), msg);

			return true;
		} catch (error) {
			const msg = (error as Error).message;
			console.log(msg, keyId, token);

			return false;
		}
	}

	async removeWbApiKey(data: Pick<UsersKeyDto, 'keyId' | 'token'>) {
		const {keyId, token} = data;
		try {
			const user = await this.getUserByToken(token);

			const key = user.wbApiKeys.find((data) => data.keyId === keyId);

			if (!key) {
				throw new NotFoundException(`${keyId} key not found!`);
			}

			await this.update({
				where: {
					id: user.id,
				},
				data: {
					wbApiKeys: {
						delete: {
							id: key.id,
						},
					},
				},
			});

			const msg = this.utilsService.createApiKeyText(
				removeApiKey,
				MarketplaceName.WB,
				key.name,
			);

			await this.bot.telegram.sendMessage(String(user.id), msg);

			return true;
		} catch (error) {
			const msg = (error as Error).message;
			console.log(msg, keyId, token);

			return false;
		}
	}

	async getUserByToken(token: string) {
		const session = await this.prisma.sessions.findUnique({
			where: {token},
			include: {telegramUser: {select: {wbApiKeys: true, ozonApiKeys: true, id: true}}},
		});

		if (!session || !session.telegramUser) {
			throw new NotFoundException('user not found');
		}

		return session.telegramUser;
	}

	async getUserToken(userId: bigint) {
		return this.prisma.sessions.findFirst({
			where: {
				telegramUserId: userId,
			},
			select: {
				token: true,
			},
		});
	}

	async removeWbKeyById(token: string, keyId: string) {
		const session = await this.prisma.sessions.findFirst({
			where: {
				token,
			},
			select: {
				telegramUserId: true,
			},
		});

		if (session) {
			await this.update({
				where: {
					id: session.telegramUserId,
				},
				data: {
					wbApiKeys: {
						deleteMany: {
							keyId,
						},
					},
				},
			});
		}
	}

	async removeOzonKeyById(token: string, keyId: string) {
		const session = await this.prisma.sessions.findFirst({
			where: {
				token,
			},
			select: {
				telegramUserId: true,
			},
		});

		if (session) {
			await this.update({
				where: {
					id: session.telegramUserId,
				},
				data: {
					ozonApiKeys: {
						deleteMany: {
							keyId,
						},
					},
				},
			});
		}
	}

	async sendWbSummary(userId: bigint, keys: WbApiKeys[] = [], token = '') {
		if (!keys.length || !token) return;
		let text = '';
		const sum: ITodaySummaryAllKeys = {
			profitSum: 0,
			comissionSum: 0,
			ordersSum: 0,
			ordersCountSum: 0,
			revenueSum: 0,
			salesSum: 0,
		};

		for (const [index, key] of keys.entries()) {
			text = text + `${numbers[index]}`;
			try {
				const summary = await this.getWbAnalyticSummary(token, key.keyId, userId, key.name);

				if (summary instanceof Error) {
					switch (summary.name) {
						case Errors.BadRequest: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								badRequestText,
							);
							return;
						}
						case Errors.Subscription: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								subscriptionWarningText,
							);
							return;
						}
						default: {
							break;
						}
					}
				} else {
					sum.profitSum += summary.profit;
					sum.comissionSum += summary.comission;
					sum.ordersSum += summary.orderSum;
					sum.ordersCountSum += summary.order;
					sum.revenueSum += summary.revenue;
					sum.salesSum += summary.sales;
				}

				text +=
					getAnalyticsSummary(key.name, summary as ITodaySummary, MarketplaceName.WB) +
					`\n\n`;
			} catch (e) {
				console.log(e);
				continue;
			}
		}
		text += analyticsSummary(sum);
		await this.telegramSendMessageService.sendSummary(userId, text);
	}

	async sendOzonSummary(userId: bigint, keys: OzonApiKeys[] = [], token = '') {
		if (!keys.length || !token) return;
		let text = '';

		let sum: ITodaySummaryAllKeys = {
			profitSum: 0,
			comissionSum: 0,
			ordersSum: 0,
			ordersCountSum: 0,
			revenueSum: 0,
			salesSum: 0,
		};

		for (const [index, key] of keys.entries()) {
			text = text + `${numbers[index]}`;
			try {
				const summary = await this.getOzonAnalyticSummary(
					token,
					key.keyId,
					userId,
					key.name,
				);

				if (summary instanceof Error) {
					switch (summary.name) {
						case Errors.BadRequest: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								badRequestText,
							);
							return;
						}
						case Errors.Subscription: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								subscriptionWarningText,
							);
							return;
						}
						default: {
							break;
						}
					}
				} else {
					sum.profitSum += summary.profit;
					sum.comissionSum += summary.comission;
					sum.ordersSum += summary.orderSum;
					sum.ordersCountSum += summary.order;
					sum.revenueSum += summary.revenue;
					sum.salesSum += summary.sales;
				}

				text =
					text +
					getAnalyticsSummary(key.name, summary as ITodaySummary, MarketplaceName.OZON) +
					`\n\n`;
			} catch {
				continue;
			}
		}
		text += analyticsSummary(sum);
		await this.telegramSendMessageService.sendSummary(userId, text);
	}

	async sendMPSummary(
		userId: bigint,
		ozonKeys: OzonApiKeys[],
		wbKeys: WbApiKeys[],
		token: string,
	) {
		if ((!ozonKeys.length && !wbKeys.length) || !token) return;
		let text = '';

		let index = 0;
		const sum: ITodaySummaryAllKeys = {
			profitSum: 0,
			comissionSum: 0,
			ordersSum: 0,
			ordersCountSum: 0,
			revenueSum: 0,
			salesSum: 0,
		};

		for (const key of ozonKeys) {
			text = text + `${numbers[index]}`;
			index++;
			try {
				const summary = await this.getOzonAnalyticSummary(
					token,
					key.keyId,
					userId,
					key.name,
				);

				if (summary instanceof Error) {
					switch (summary.name) {
						case Errors.BadRequest: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								badRequestText,
							);
							return;
						}
						case Errors.Subscription: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								subscriptionWarningText,
							);
							return;
						}
						default: {
							break;
						}
					}
				} else {
					sum.profitSum += summary.profit;
					sum.comissionSum += summary.comission;
					sum.ordersSum += summary.orderSum;
					sum.ordersCountSum += summary.order;
					sum.revenueSum += summary.revenue;
					sum.salesSum += summary.sales;
				}

				text =
					text +
					getAnalyticsSummary(key.name, summary as ITodaySummary, MarketplaceName.OZON) +
					`\n\n`;
			} catch {
				continue;
			}
		}

		for (const key of wbKeys) {
			text = text + `${numbers[index]}`;
			index++;
			try {
				const summary = await this.getWbAnalyticSummary(token, key.keyId, userId, key.name);

				if (summary instanceof Error) {
					switch (summary.name) {
						case Errors.BadRequest: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								badRequestText,
							);
							return;
						}
						case Errors.Subscription: {
							await this.telegramSendMessageService.sendSummary(
								userId,
								subscriptionWarningText,
							);
							return;
						}
						default: {
							break;
						}
					}
				} else {
					sum.profitSum += summary.profit;
					sum.comissionSum += summary.comission;
					sum.ordersSum += summary.orderSum;
					sum.ordersCountSum += summary.order;
					sum.revenueSum += summary.revenue;
					sum.salesSum += summary.sales;
				}

				text +=
					getAnalyticsSummary(key.name, summary as ITodaySummary, MarketplaceName.WB) +
					`\n\n`;
			} catch (e) {
				console.log(e);
				continue;
			}
		}

		text += analyticsSummary(sum);
		await this.telegramSendMessageService.sendSummary(userId, text);
		return {
			status: 'SUCCESS',
		};
	}

	private async getOzonAnalyticSummary(
		token: string,
		keyId: string,
		userId: bigint,
		keyName: string,
	) {
		const summary = await this.userApiService.getOzonAnalyticsSummary(token, keyId);

		if (summary instanceof Error) {
			return summary;
		}

		if (!summary) {
			await this.removeOzonKeyById(token, keyId);
			await this.telegramSendMessageService.sendSummary(
				userId,
				`Произошла ошибка, ${keyName} ключ не активный!`,
			);
			throw new Error(`getOzonAnalyticSummary: ключ ${keyId} не активный`);
		}

		return {
			...summary,
		};
	}

	private async getWbAnalyticSummary(
		token: string,
		keyId: string,
		userId: bigint,
		keyName: string,
	) {
		const summary = await this.userApiService.getWbAnalyticsSummary(token, keyId);

		if (summary instanceof Error) {
			return summary;
		}

		if (!summary) {
			await this.removeWbKeyById(token, keyId);
			await this.telegramSendMessageService.sendSummary(
				userId,
				`Произошла ошибка, ${keyName} ключ не активный!`,
			);
			throw new Error(`getWbAnalyticSummary: ключ ${keyId} не активный`);
		}

		return {
			...summary,
		};
	}
}
