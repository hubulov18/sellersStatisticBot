interface ITimezone {
	timezone: string;
	callback_data: string;
	moment_js_format: string;
}

export const timezones: ITimezone[] = [
	{
		timezone: 'Калининград (UTC+2)',
		callback_data: 'timezone_-1',
		moment_js_format: 'Europe/Kaliningrad',
	},
	{
		timezone: 'Москва (UTC+3)',
		callback_data: 'timezone_0',
		moment_js_format: 'Europe/Kirov',
	},
	{
		timezone: 'Самара (UTC+4)',
		callback_data: 'timezone_1',
		moment_js_format: 'Europe/Samara',
	},
	{
		timezone: 'Екатеринбург и Актау (UTC+5)',
		callback_data: 'timezone_2',
		moment_js_format: 'Asia/Yekaterinburg',
	},
	{
		timezone: 'Омск и Нур-Султан (UTC+6)',
		callback_data: 'timezone_3',
		moment_js_format: 'Asia/Omsk',
	},
	{
		timezone: 'Красноярск (UTC+7)',
		callback_data: 'timezone_4',
		moment_js_format: 'Asia/Krasnoyarsk',
	},
	{
		timezone: 'Иркутск (UTC+8)',
		callback_data: 'timezone_5',
		moment_js_format: 'Asia/Irkutsk',
	},
	{
		timezone: 'Якутск (UTC+9)',
		callback_data: 'timezone_6',
		moment_js_format: 'Asia/Yakutsk',
	},
	{
		timezone: 'Владивосток (UTC+10)',
		callback_data: 'timezone_7',
		moment_js_format: 'Asia/Vladivostok',
	},
	{
		timezone: 'Магадан (UTC+11)',
		callback_data: 'timezone_8',
		moment_js_format: 'Asia/Magadan',
	},
	{
		timezone: 'Камчатка (UTC+12)',
		callback_data: 'timezone_9',
		moment_js_format: 'Asia/Kamchatka',
	},
];
