import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {UsersService} from '../users/users.service';

@Injectable()
export class SchedulerService {
	constructor(private readonly usersService: UsersService) {}

	@Cron('0 * * * *')
	async sendSummaryAnalytics() {
		const hour = new Date().getHours();

		const keys = await this.usersService.getUsersKeysByHour(hour);

		for (const key of keys) {
			const {wbApiKeys, ozonApiKeys, session} = key;
			const id = String(key.id);

			if (session) {
				await this.usersService.createAnalyticsSummaryJob(ozonApiKeys, wbApiKeys, id);
			}
		}
		return;
	}
}
