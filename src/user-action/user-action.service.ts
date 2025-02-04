import {Injectable} from '@nestjs/common';
import {PrismaService} from '../utils/prisma.service';

@Injectable()
export class UserActionService {
	constructor(private readonly prisma: PrismaService) {}

	async create(action: string, userId: number) {
		return this.prisma.telegramUserAction.create({
			data: {
				action,
				telegramUser: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}
}
