import {ITodaySummary, ITodaySummaryAllKeys, MarketplaceName} from '../types';
import { IUserApiKey } from "../users/users.interface";

export const startMenuText = `Привет✌️ Это Shopstat bot.
Я буду ежедневно присылать уведомления о состоянии вашего бизнеса
`;

export const askPhoneText = `
Начнём подключение 💻
Ваш номер телефона совпадает с тем, на который зарегистрирован аккаунт в Shopstat?`;

export const canNotFindUserText = `Ваш номер не совпадает с номером, на который зарегистрирован аккаунт Shopstat.
Подключите ваш аккаунт с помощью токена`;

export const askPhoneNumber = `Для получения списка подключенных кабинетов, предоставьте мне доступ к вашему номеру телефона. 
Это безопасно, я собираю данные из сервиса Shopstat`;

export const hasNotAccount = `
Перейдите <a href='https://app.shopstat.ru/personal/area'>по ссылке в свой аккаунт Shopstat</a>, чтобы получить токен.
Скопируйте его и вставьте в сюда ⬇️
`;

export const choseMenuText = 'Выберите пункт в меню';

export const mainMenuText = `<b>Выберите один из пунктов главного меню</b>`;

export const incorrectToken =
	'Токен некорректный, попробуйте сгенерировать снова или напишите в поддержку';

export const emptyKeys = `
Я не нашел подключенных кабинетов к аккаунту Shopstat 🙁
Перейдите по ссылке и добавьте ваши кабинеты в аккаунт Shopstat. 
Это займет немного времени 👌\n
Если кабинеты подключены, но не отображаются - свяжитесь с поддержкой
`;

export const emptyActiveKey = `
❎Уведомления отключены

Для автоматического включения необходимо добавить кабинеты в отслеживание.
Выберите в настройках аккаунта пункт меню "Скрытые кабинеты"
`;

export const notFoundText = 'Такого номера не существует, введите номер из списка';

export const selectShops = `
Введите номера кабинетов, по которым хотите получать сводку.\n
Изменить список вы сможете в настройках аккаунта. 
Формат ввода: 1, 2, 3`;

export const selectShopsV2 = `Выберите кабинеты по которым хотите получить сводку.`;
export const successAddShopsText = `Кабинеты SHOPS успешно добавлены в отслеживание 👌`;

export const shopNotTrackedText = `Кабинеты больше не отслеживаются.
Теперь они находятся в разделе "Скрытые кабинеты"`;

export const shopNotTrackedList = (keys: IUserApiKey[]) => {
	const shops: string = keys.reduce((acc, currentValue, currentIndex) => {
		return (acc += `${currentIndex+1}. ${currentValue.name}\n`);
	}, '');
	return `Кабинеты\n<b>${shops}</b>больше не отслеживаются. \n\nТеперь они находятся в разделе <b>Скрытые кабинеты</b>`;

}
export const successAddShop = `Кабинеты успешно добавлены в отслеживание 👌 
\nЕжедневные уведомления будут приходить вам в HOUR. 
Часовой пояс: TIMEZONE`;

export const successCreateTimezone = `
Время успешно установлено 🎉

Теперь ежедневно в HOUR [TIMEZONE] я буду присылать вам сводные данные по кабинетам:\nSHOPS`;

export const infoTime = `Ежедневные уведомления я присылаю вам в HOUR 🙂 
Часовой пояс: TIMEZONE`;

export const getShops = `Список кабинетов, которые я нашел: \nSHOPS`;

export const addNewApiKey = `Добавлен новый ключ MARKETPLACE NAME
Теперь я буду присылать сводку и по нему👌`;

export const removeApiKey = `Удалён ключ MARKETPLACE NAME`;

export const getAnalyticsSummary = (
	keyName: string,
	summary: ITodaySummary,
	mpName: MarketplaceName,
) => {
	const {revenue, sales, order, orderSum, profit, comission} = summary;

	return ` <b> ${keyName} ${mpName}</b> [данные за посление 24 часа]

<b>Заказы</b>
Количество - ${order} шт.
Сумма - ${orderSum} р.

<b>Продажи</b>
Количество - ${sales} шт.
Сумма - ${revenue} р.

<b>Прибыль</b>
Комиссия - ${comission} р.
<b>Прибыль</b> - ${profit} р.`;
};

export const analyticsSummary = (summary: ITodaySummaryAllKeys) => {
	const {profitSum, comissionSum, ordersSum, ordersCountSum, revenueSum, salesSum} = summary;
	return `
	<b>🟰 ИТОГО</b>
	
	<b>Заказы</b>
	Количество - <b>${ordersCountSum} шт.</b>
	Сумма - <b>${ordersSum} р.</b>
	
	<b>Продажи</b>
	Количество - <b>${salesSum} шт.</b>
	Сумма - <b>${revenueSum} р.</b>
	
	Комиссия - <b>${comissionSum} р.</b>	
	<b>Прибыль - ${profitSum} р.</b>
	`;
};

export const monitoringKeysText = `❎Все кабинеты скрыты
 
Выберите пункт меню "Скрытые кабинеты" и добавьте номера кабинетов в отслеживание`;

export const hiddenKeys = `<b>Все кабинеты отслеживаются</b> 👌

Если хотите убрать из отслеживания кабинеты — перейдите в "Отслеживаемые кабинеты" и выберите те, которые необходимо скрыть`;

export const getAllActiveShopsText = `Список кабинетов, по которым приходят уведомления о сводных данных:
SHOPS
\nВы можете скрыть кабинеты, чтобы данные не отображались в ежедневных уведомлениях`;

export const getAllInActiveShopsText = `Кабинеты, по которым я не присылаю данные.\n
Добавить в отслеживание:
SHOPS`;

export const about = `
Shopstat bot - Я создан для продавцов, торгующих на Wildberries или Ozon.\n
✅ Быстрый и автоматизированный доступ к сводным данным кабинетов в Shopstat.
Сводные данные отображают следующую информацию: 
<b>🔹 Продажи</b>
<b>🔹 Заказы</b>
<b>🔹 Возвраты</b>
<b>🔹 Прибыль и комиссия</b>
<b>🔹 Логистика</b>
<b>🔹 Сумма склада</b>

✅ Удобное время для получения ежедневных уведомлений о состоянии вашего бизнеса
`;

export const specifyTimezoneText = `Укажите ваш часовой пояс, чтобы я мог правильно отслеживать время 🕐`;

export const specifyHourText = 'Укажите время, когда вам удобно получать ежедневную сводку 📋';

export const enterShopsNumberForSummaryText = `Введите номера кабинетов для получения сводных данных:
SHOPS`;

export const getSummaryNowText =
	'Не дожидайтесь ежедневных уведомлений. \nПолучайте сводные данные по кабинетам прямо сейчас 😉';

export const enterShopsNumberForHideText = `Введите номера кабинетов, которые необходимо скрыть.`;

export const successAddShops = `Кабинеты успешно добавлены в отслеживание 👌`;

export const ACTIONS = {
	// пока в разрабоке
	IN_WORKS_REVIEWS: 'IN_WORKS_REVIEWS',
	IN_WORKS_LEFTOVER: 'IN_WORKS_LEFTOVER',

	// Register
	HAS_ACCOUNT: 'HAS_ACCOUNT', // Регистрация по номерому телефона
	HAS_NOT_ACCOUNT: 'HAS_NOT_ACCOUNT', // Регистрация по токену

	ACCOUNT_SETTINGS: 'ACCOUNT_SETTINGS',
	START: 'START',
	BACK: 'BACK',
	ABOUT: 'ABOUT',

	SELECT_ALL_SHOPS: 'SELECT_ALL_SHOPS', // Получить все магазины
	SHOW_ALL_ACTIVE_SHOPS: 'SHOW_ALL_ACTIVE_SHOPS', // Получить отслеживаемых магазинов
	SHOW_ALL_INACTIVE_SHOPS: 'SHOW_ALL_INACTIVE_SHOPS', // Получить не отслеживаемых магазинов
	ENTER_MANUALLY: 'ENTER_MANUALLY', // Ввод в ручную
	REMOVE_SHOPS: 'REMOVE_SHOPS', // Скрыть магазина
	ADD_SHOPS: 'ADD_SHOPS', // Добавить магазина в отслеживаемых
	TIMEZONE: 'timezone_', // Часавой пояс
	UPDATE_TIMEZONE: 'UPDATE_TIMEZONE', // Изменить часавой пояс
	UPDATE_TIME: 'UPDATE_TIME', // Изменить время
	GET_SUMMARY: 'GET_SUMMARY', // Получить сводку сейчас
	GET_WB_SHOPS: 'GET_WB_SHOPS', // Получить кабинетов ВБ
	GET_OZON_SHOPS: 'GET_OZON_SHOPS', // Получить кабинетов Озон
	GET_OZON_SHOPS_SUMMARY: 'GET_OZON_SHOPS_SUMMARY', // Получить сводку по кабинетам Озон
	GET_WB_SHOPS_SUMMARY: 'GET_WB_SHOPS_SUMMARY', // Получить сводку по кабинетам ВБ
	GET_HOUR: 'get_hour_', // Получить время
	SELECT_SHOP_ALL: 'SELECT_SHOP_ALL', //Выбор магазина
	SELECT_SHOP_WB: 'SELECT_SHOP_WB',
	SELECT_SHOP_OZON: 'SELECT_SHOP_OZON',
	APPLY_ALL: 'APPLY_ALL',
	APPLY_WB: 'APPLY_WB',
	APPLY_OZON: 'APPLY_OZON',
	SELECT_ALL_SHOPS_OZON: 'SELECT_ALL_SHOPS_OZON',
	SELECT_ALL_SHOPS_WB: 'SELECT_ALL_SHOPS_WB',
	SELECT_SHOP: 'SELECT_SHOP',
	BACK_TO_TZ: 'BACK_TO_TZ',
};

export const SCENES = {
	REGISTER_BY_PHONE: 'REGISTER_BY_PHONE',
	REGISTER_BY_TOKEN: 'REGISTER_BY_TOKEN',
	GET_SHOPS: 'GET_SHOPS',
	REMOVE_SHOPS: 'REMOVE_SHOPS',
	ADD_SHOPS: 'ADD_SHOPS',
	TIMEZONE: 'TIMEZONE',
	GET_SUMMARY: 'GET_SUMMARY',
	WB_SUMMARY: 'WB_SUMMARY',
	OZON_SUMMARY: 'OZON_SUMMARY',
};


export const inTheWorkReview = `Функция оповещения о новых отзывах на товары уже в работе. 
Совсем скоро вы сможете её попробовать 👌`;

export const inTheWorkLeftovers = `Функция оповещения о том, что закончились остатки уже в работе. 
Совсем скоро вы сможете её попробовать 👌`;

export const TELEGRAM_ERRORS = {
	USER_BLOCKED: 'bot was blocked by the user',
};

export const subscriptionWarningText = `У меня готов для вас отчет, но вам необходимо оплатить подписку <a href='https://app.shopstat.ru/'>по ссылке в свой аккаунт Shopstat</a>`;

export const badRequestText = 'Сейчас данные не доступны, пожалуйста попробуйте позже';
export const shopName = (name: string, added = true) => {
	if (added) return `${name} ✅`;
	else return `${name}`;
};

export const selectWbKeys = 'Выберите  кабинеты WB для получения сводных данных:';

export const selectOzonKeys = 'Выберите  кабинеты Ozon для получения сводных данных:';

export const numbers: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export const Errors = {
	Subscription: 'Subscription',
	BadRequest: 'Bad request',
};

export const timeOut = (sec: number) => {
	return new Promise((resolve) => setTimeout(resolve, sec));
}
