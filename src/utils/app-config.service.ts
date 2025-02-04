/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AppConfigService {
	constructor(private readonly configService: ConfigService) {}

	get DATABASE_URL(): string {
		return this.configService.get<string>('DATABASE_URL')!;
	}

	get BOT_TOKEN(): string {
		return this.configService.get<string>('BOT_TOKEN')!;
	}

	get BASE_URL_SHOPSTAT(): string {
		return this.configService.get<string>('BASE_URL_SHOPSTAT')!;
	}

	get SECRET_KEY_SHOPSTAT(): string {
		return this.configService.get<string>('SECRET_BOT_KEY')!;
	}

	get REDIS_HOST(): string {
		return this.configService.get<string>('REDIS_HOST')!;
	}

	get REDIS_PORT(): string {
		return this.configService.get<string>('REDIS_PORT')!;
	}

	get REDIS_PASSWORD(): string {
		return this.configService.get<string>('REDIS_PASSWORD')!;
	}
}
