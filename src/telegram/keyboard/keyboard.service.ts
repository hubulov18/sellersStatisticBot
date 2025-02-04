import {Injectable} from '@nestjs/common';
import {Markup} from 'telegraf';
import {CallbackQuery} from 'typegram';
import {timezones} from '../../utils/timezone';
import {ACTIONS, shopName} from '../constants';
import {MyContext} from '../telegram-context';

export enum Shops {
	OZON = 'OZON',
	WB = 'WB',
	ALL = 'ALL',
}
@Injectable()
export class KeyboardService {
	startMenu(registerStatus: boolean) {
		const isNotRegistered = [
			[Markup.button.callback('✅ Да', ACTIONS.HAS_ACCOUNT)],
			[Markup.button.callback('️️️ ❌ Нет', ACTIONS.HAS_NOT_ACCOUNT)],
			[Markup.button.callback('💭 Не помню', ACTIONS.HAS_ACCOUNT)],
			[Markup.button.callback('ℹ️ О боте', ACTIONS.ABOUT)],
		];

		const isRegistered = [
			[Markup.button.callback('📃 Получить сводные данные сейчас ', ACTIONS.GET_SUMMARY)],
			[Markup.button.callback('⚙️ Настройки аккаунта', ACTIONS.ACCOUNT_SETTINGS)],
			[Markup.button.callback('👨‍💻 Оповестить о новых отзывах', ACTIONS.IN_WORKS_REVIEWS)],
			[
				Markup.button.callback(
					'👨‍💻 Оповестить о закончившихся остатках',
					ACTIONS.IN_WORKS_LEFTOVER,
				),
			],
			[Markup.button.callback('ℹ️ О боте', ACTIONS.ABOUT)],
		];

		const keyboard = registerStatus ? isRegistered : isNotRegistered;

		return {...Markup.inlineKeyboard(keyboard)};
	}

	shopsButtons() {
		const keyboard = [
			[Markup.button.callback('🔎 Отслеживаемые кабинеты', ACTIONS.SHOW_ALL_ACTIVE_SHOPS)],
			[Markup.button.callback('✖ Скрытые кабинеты', ACTIONS.SHOW_ALL_INACTIVE_SHOPS)],
			[Markup.button.callback('⌚ Изменить время уведомлений', ACTIONS.UPDATE_TIME)],
			[this.startButton('💻 Главное меню')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	removeShopsButtons(keysCount: number) {
		const button = !keysCount
			? [Markup.button.callback('Скрытые кабинеты', ACTIONS.SHOW_ALL_INACTIVE_SHOPS)]
			: [Markup.button.callback('✖ Скрыть кабинеты', ACTIONS.REMOVE_SHOPS)];

		const keyboard = [
			button,
			[Markup.button.callback('◀️ Назад', ACTIONS.ACCOUNT_SETTINGS)],
			[this.startButton('💻 Главное меню')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	addShopsButtons(keysCount: number) {
		const button = !keysCount
			? [Markup.button.callback('🔎 Отслеживаемые кабинеты', ACTIONS.SHOW_ALL_ACTIVE_SHOPS)]
			: [Markup.button.callback('Добавить в отслеживание', ACTIONS.ADD_SHOPS)];

		const keyboard = [
			button,
			[Markup.button.callback('◀️ Назад', ACTIONS.ACCOUNT_SETTINGS)],
			[this.startButton('💻 Главное меню')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	selectShopsButtons(ctx: MyContext, mode: Shops) {
		let buttons = [];

		ctx.session.keys.forEach((key: any) => {
			if (key.selected)
				buttons.push([
					Markup.button.callback(
						`${shopName(key.name)}`,
						`${ACTIONS[`SELECT_SHOP_${mode}`]}-${key.keyId}`,
					),
				]);
			else
				buttons.push([
					Markup.button.callback(
						`${shopName(key.name, false)}`,
						`${ACTIONS[`SELECT_SHOP_${mode}`]}-${key.keyId}`,
					),
				]);
		});
		switch (mode) {
			case Shops.WB: {
				buttons.push(
					[Markup.button.callback('✅ Применить', ACTIONS.APPLY_WB)],
					[Markup.button.callback('🔡 Выбрать все магазины', ACTIONS.SELECT_ALL_SHOPS_WB)],
				);
				break;
			}
			case Shops.OZON: {
				buttons.push(
					[Markup.button.callback('✅ Применить', ACTIONS.APPLY_OZON)],
					[
						Markup.button.callback(
							'🔡 Выбрать все магазины',
							ACTIONS.GET_OZON_SHOPS_SUMMARY,
						),
					],
				);
				break;
			}
			default: {
				buttons.push(
					[Markup.button.callback('✅ Применить', ACTIONS.APPLY_ALL)],
					[Markup.button.callback('🔡 Выбрать все магазины', ACTIONS.SELECT_ALL_SHOPS)],
				);
				break;
			}
		}
		buttons.push(
			[Markup.button.callback('◀️ Назад', ACTIONS.BACK)],
			[this.startButton('💻 Главное меню')],
		);
		//[Markup.button.callback('Выбрать все магазины', ACTIONS.GET_WB_SHOPS_SUMMARY)]
		return {...Markup.inlineKeyboard(buttons)};
	}

	goMenu() {
		const keyboard = [[this.startButton('💻 Главное меню')]];

		return {...Markup.inlineKeyboard(keyboard)};

	}

	getPhoneNumber() {
		return {
			reply_markup: {
				one_time_keyboard: true,
				resize_keyboard: true,
				keyboard: [
					[
						Markup.button.contactRequest('Разрешить доступ'),
						{
							text: 'Вернуться назад',
						},
					],
				],
			},
		};
	}

	selectAllShops() {
		const keyboard = [
			[Markup.button.callback('Выбрать все магазины', ACTIONS.SELECT_ALL_SHOPS)],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	getTimezones() {
		return {
			...Markup.inlineKeyboard([
				...timezones.map(({timezone, callback_data}) => [
					Markup.button.callback(timezone, callback_data) as CallbackQuery,
				]),
				[Markup.button.callback('◀️ Назад', ACTIONS.UPDATE_TIME)],
			]),
		};
	}

	getSummaryById() {
		return {
			...Markup.inlineKeyboard([
				...timezones.map(({timezone, callback_data}) => [
					Markup.button.callback(timezone, callback_data) as CallbackQuery,
				]),
			]),
		};
	}

	getMp() {
		const keyboard = [
			[Markup.button.callback('OZON', ACTIONS.GET_OZON_SHOPS)],
			[Markup.button.callback('WILDBERRIES', ACTIONS.GET_WB_SHOPS)],
			[Markup.button.callback('◀️ Назад', ACTIONS.BACK)],
			[this.startButton('💻 Главное меню')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	getOzonShops() {
		const keyboard = [
			[Markup.button.callback('Выбрать все магазины', ACTIONS.GET_OZON_SHOPS_SUMMARY)],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	getWBShops() {
		const keyboard = [
			[Markup.button.callback('Выбрать все магазины', ACTIONS.GET_WB_SHOPS_SUMMARY)],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	// Создаем часы
	getHours() {
		const hourCount = 24;
		const inlineButtons: CallbackQuery[] = [];
		const allButtons = [];

		for (let index = 1; index <= hourCount; index++) {
			inlineButtons.push(
				Markup.button.callback(
					`${index}:00`,
					`${ACTIONS.GET_HOUR}${index}`,
				) as CallbackQuery,
			);

			if (index % 6 === 0) {
				allButtons.push([...inlineButtons]);
				inlineButtons.length = 0;
			}
		}

		return {
			...Markup.inlineKeyboard([
				...allButtons,
				[Markup.button.callback('◀️ Назад', ACTIONS.BACK_TO_TZ)],
			]),
		};
	}

	incorrectToken() {
		const keyboard = [
			[Markup.button.callback('Сгенерировать снова', ACTIONS.HAS_NOT_ACCOUNT)],
			[Markup.button.url('Связаться с поддержкой', 'https://t.me/shopstatsp')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	emptyKeys() {
		const keyboard = [
			[Markup.button.url('Подключить кабинет', 'https://app.shopstat.ru/analyt/adding-key')],
			[Markup.button.url('Связаться с поддержкой', 'https://t.me/shopstatsp')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	updateTime() {
		const keyboard = [
			[Markup.button.callback('⏰ Изменить время получения', ACTIONS.UPDATE_TIMEZONE)],
			[Markup.button.callback('◀️ Назад', ACTIONS.ACCOUNT_SETTINGS)],
			[this.startButton('💻 Главное меню')],
		];

		return {...Markup.inlineKeyboard(keyboard)};
	}

	backOrMenu() {
		return {
			...Markup.inlineKeyboard([
				[this.backButton('Назад')],
				[this.startButton('💻 Главное меню')],
			]),
		};
	}

	private backButton(text = 'Назад') {
		return Markup.button.callback(text, ACTIONS.BACK) as CallbackQuery;
	}

	private startButton(text = '💻 Главное меню'): CallbackQuery {
		return Markup.button.callback(text, ACTIONS.START) as unknown as CallbackQuery;
	}
}
