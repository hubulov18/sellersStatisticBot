import {InjectQueue, Process, Processor} from '@nestjs/bull';
import {forwardRef, Inject} from '@nestjs/common';
import {OzonApiKeys, WbApiKeys} from '@prisma/client';
import {Job, Queue} from 'bull';
import {UsersService} from '../../../users/users.service';
import {QUEUES} from '../../../utils/queues';

export interface IAnalyticsSummaryJob {
	ozonKeys: {
		id: number;
		keyId: string;
		name: string;
		isObserved: boolean;
		telegramUserId: string;
	}[];
	wbKeys: {
		id: number;
		keyId: string;
		name: string;
		isObserved: boolean;
		telegramUserId: string;
	}[];
	id: string;
}

@Processor(QUEUES.ANALYTICS_SUMMARY)
export class AnalyticsSummaryService {
	constructor(
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		@InjectQueue(QUEUES.ANALYTICS_SUMMARY) private readonly analyticsSummaryQueue: Queue,
	) {}

	async createAnalyticsSummaryJob(ozonKeys: OzonApiKeys[], wbKeys: WbApiKeys[], id: string) {
		const data: IAnalyticsSummaryJob = {
			ozonKeys: ozonKeys.map((key) => {
				return {
					...key,
					telegramUserId: String(key.telegramUserId),
				};
			}),
			wbKeys: wbKeys.map((key) => {
				return {
					...key,
					telegramUserId: String(key.telegramUserId),
				};
			}),
			id,
		};

		await this.analyticsSummaryQueue.add(data);
	}

	@Process({concurrency: 10})
	async sendDailyReport(job: Job<IAnalyticsSummaryJob>) {
		const id = BigInt(job.data.id);

		const ozonKeys = job.data.ozonKeys.map((key) => {
			return {
				...key,
				telegramUserId: BigInt(key.telegramUserId),
			};
		});

		const wbKeys = job.data.wbKeys.map((key) => {
			return {
				...key,
				telegramUserId: BigInt(key.telegramUserId),
			};
		});
		const session = await this.usersService.getSession(BigInt(id));
		if (session?.token) {
			await this.usersService.sendMPSummary(id, ozonKeys, wbKeys, session.token);
		}
		return {
			status: 'ERROR',
			message: 'Токен не активен',
		};
	}
}
