export enum MarketplaceName {
	OZON = 'Ozon',
	WB = 'Wildberries',
}

export interface ITodaySummary {
	revenue: number;
	sales: number;
	order: number;
	orderSum: number;
	reset: number;
	resetSum: number;
	profit: number;
	comission: number;
	toClient: number;
	fromClient: number;
	retailPrice: number;
}

export interface ITodaySummaryAllKeys {
	profitSum: number;
	comissionSum: number;
	ordersSum: number;
	ordersCountSum: number;
	revenueSum: number;
	salesSum: number;
}

export interface IGraphqlError {
	errors?: {
		message: string;
		originalError?: {
			extensions?: {
				code?: string;
			};
		};
	}[];
}

export interface IWBAnalyticsSummaryResponse extends IGraphqlError {
	data: {
		wbAnalyticsSummaryByPeriod?: ITodaySummary;
	};
}

export interface IOzonAnalyticsSummaryResponse extends IGraphqlError {
	data: {
		ozonAnalyticsSummaryByPeriod?: ITodaySummary;
	};
}

export interface IWBAnalyticsComingPayments extends IGraphqlError {
	data: {
		wbAnalyticsComingPayments?: ISummaryAndPayments;
	};
}

export interface IOzonAnalyticsComingPayments extends IGraphqlError {
	data: {
		ozonAnalyticsComingPayments?: ISummaryAndPayments;
	};
}

export interface ISummaryAndPayments {
	amount: number;
	date: string;
}

export interface IKey {
	keyId: string;
	name: string;
}
