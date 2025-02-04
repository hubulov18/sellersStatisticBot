import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {Errors} from '../telegram/constants';
import {IOzonAnalyticsSummaryResponse, IWBAnalyticsSummaryResponse} from '../types';
import {AppConfigService} from '../utils/app-config.service';
import {IUserResponseByPhone, IUserResponseByToken, IUserSubscriptionDate} from './users.interface';

@Injectable()
export class UsersApiService {
	private readonly baseUrl = this.appConfigServoce.BASE_URL_SHOPSTAT;
	private readonly DEFAULT_HEADERS = {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
	};

	private readonly analyticsSummaryParams = `
	revenue,
	sales,
	order,
	orderSum,
	reset,
	resetSum,
	profit,
	comission,
	toClient,
	fromClient,
	retailPrice,`;

	constructor(private readonly appConfigServoce: AppConfigService) {}

	async checkUserByPhone(phone: string): Promise<null | IUserResponseByPhone['data']> {
		try {
			const response = await axios.post<IUserResponseByPhone>(
				`${this.baseUrl}/users/check-phone`,
				{
					phone,
				},
				{
					headers: {
						'secret-bot-key': this.appConfigServoce.SECRET_KEY_SHOPSTAT,
						...this.DEFAULT_HEADERS,
					},
				},
			);

			if (response.data.error || response.status !== 200) {
				return null;
			}

			return response.data.data;
		} catch (error) {
			return null;
		}
	}

	async checkUserByToken(token: string): Promise<null | IUserResponseByToken['data']> {
		try {
			const response = await axios.post<IUserResponseByToken>(
				`${this.baseUrl}/users/check-token`,
				{},
				{
					headers: {
						token,
						...this.DEFAULT_HEADERS,
					},
				},
			);

			if (response.data.error || response.status !== 200) {
				return null;
			}

			return response.data.data;
		} catch (error) {
			return null;
		}
	}

	async checkSubscription(token: string): Promise<null | IUserSubscriptionDate['data']> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/users/check-subscription`,
				{},
				{
					headers: {
						token,
						...this.DEFAULT_HEADERS,
					},
				},
			);

			if (response.data.error || response.status !== 200) {
				return null;
			}

			return response.data.data;
		} catch (error) {
			return null;
		}
	}

	async getWbAnalyticsSummary(token: string, keyId = '') {
		try {
			const response = await axios.post<IWBAnalyticsSummaryResponse>(
				`${this.baseUrl}/graphql`,
				{
					query: `
						query wbAnalyticsSummaryByPeriod{
							wbAnalyticsSummaryByPeriod(keyId: "${keyId}"){
								${this.analyticsSummaryParams}
							}
						}`,
				},
				{
					headers: {
						authorization: token,
						...this.DEFAULT_HEADERS,
					},
				},
			);

			const {data} = response;

			if (data.errors) {
				const notFoundKey = this.checkError(data.errors);

				if (notFoundKey && keyId) {
					return false;
				}
				if (data.errors[0].originalError?.extensions?.code === '403') {
					const error = new Error();
					error.name = Errors.Subscription;
					return error;
				}
			}
			if (data.data) {
				return data.data.wbAnalyticsSummaryByPeriod ?? false;
			} else throw Error('Попробуйте позже');
		} catch (error) {
			const message = (error as Error).message;
			console.log(message);
			const customError = new Error('Попробуйте позже');
			customError.name = Errors.BadRequest;
			return customError;
		}
	}

	async getOzonAnalyticsSummary(token: string, keyId = '') {
		try {
			const response = await axios.post<IOzonAnalyticsSummaryResponse>(
				`${this.baseUrl}/graphql`,
				{
					query: `
						query ozonAnalyticsSummaryByPeriod{
							ozonAnalyticsSummaryByPeriod(keyId: "${keyId}"){
								${this.analyticsSummaryParams}
							}
						}`,
				},
				{
					headers: {
						authorization: token,
						...this.DEFAULT_HEADERS,
					},
				},
			);

			const {data} = response;
			if (data.errors) {
				const notFoundKey = this.checkError(data.errors);

				if (notFoundKey && keyId) {
					return false;
				}
				if (data.errors[0].originalError?.extensions?.code === '403') {
					const error = new Error();
					error.name = Errors.Subscription;
					return error;
				}
			}
			if (data.data) {
				return data.data.ozonAnalyticsSummaryByPeriod ?? false;
			} else throw Error(`Попробуйте позже данные отсутствуют keyId ${keyId}`);
		} catch (error) {
			const message = (error as Error).message;
			console.log(`${message} keyId ${keyId}`);
			const customError = new Error('Попробуйте позже');
			customError.name = Errors.BadRequest;
			return customError;
		}
	}

	// async getOzonAnalyticsComingPayments(token: string, keyId = '') {
	// 	try {
	// 		const response = await axios.post<IOzonAnalyticsComingPayments>(
	// 			`${this.baseUrl}/graphql`,
	// 			{
	// 				query: `
	// 					query ozonAnalyticsComingPayments{
	// 						ozonAnalyticsComingPayments(keyId: "${keyId}"){
	// 						${this.comingPaymentsParams}
	// 						}
	// 					}`,
	// 			},
	// 			{
	// 				headers: {
	// 					authorization: token,
	// 					...this.DEFAULT_HEADERS,
	// 				},
	// 			},
	// 		);

	// 		const {data} = response;

	// 		if (data.errors) {
	// 			const notFoundKey = this.checkError(data.errors);

	// 			if (notFoundKey && keyId) {
	// 				await this.userService.removeOzonKeyById(token, keyId);
	// 				return false;
	// 			}
	// 		}

	// 		return response.data.data.ozonAnalyticsComingPayments ?? false;
	// 	} catch (error) {
	// 		const message = (error as Error).message;
	// 		throw new Error(message);
	// 	}
	// }

	// async getWbAnalyticsComingPayments(token: string, keyId = '') {
	// 	try {
	// 		const response = await axios.post<IWBAnalyticsComingPayments>(
	// 			`${this.baseUrl}/graphql`,
	// 			{
	// 				query: `
	// 					query wbAnalyticsComingPayments{
	// 						wbAnalyticsComingPayments(keyId: "${keyId}"){
	// 						${this.comingPaymentsParams}
	// 						}
	// 					}`,
	// 			},
	// 			{
	// 				headers: {
	// 					authorization: token,
	// 					...this.DEFAULT_HEADERS,
	// 				},
	// 			},
	// 		);

	// 		const {data} = response;

	// 		if (data.errors) {
	// 			const notFoundKey = this.checkError(data.errors);
	// 			if (notFoundKey && keyId) {
	// 				await this.userService.removeWbKeyById(token, keyId);
	// 				return false;
	// 			}
	// 		}

	// 		return response.data.data.wbAnalyticsComingPayments ?? false;
	// 	} catch (error) {
	// 		const message = (error as Error).message;
	// 		throw new Error(message);
	// 	}
	// }

	private checkError(errors: {message: string}[]) {
		return errors.find(({message}) => message === 'Указанный ключ не найден');
	}
}
