import {Injectable} from '@nestjs/common';
import {IKey, MarketplaceName} from '../types';

@Injectable()
export class UtilsService {
	createShopsText(template: string, keys: IKey[], enter = false) {
		const shopsString = this.getShopsString(keys, enter);

		return this.replaceShopsText(template, shopsString);
	}

	createTimeText(template: string, hour: string, timezone: string) {
		return this.replaceTimeText(template, hour, timezone);
	}

	createApiKeyText(template: string, mpName: MarketplaceName, shopName: string) {
		return this.replaceMpAndName(template, mpName, shopName);
	}

	private getShopsString(keys: IKey[], enter: boolean) {
		if (enter) {
			return keys
				.map((key, index) => {
					return `<b>${index + 1}. ${key.name}</b>\n`;
				})
				.join('');
		}

		return keys
			.map((key) => {
				return `<b>${key.name},</b> `;
			})
			.join('');
	}

	private replaceShopsText(template: string, shops: string) {
		return template.replace('SHOPS', shops);
	}

	private replaceTimeText(template: string, hour: string, timezone: string) {
		return template.replace('HOUR', hour).replace('TIMEZONE', timezone);
	}

	private replaceMpAndName(template: string, mpName: MarketplaceName, shopName: string) {
		return template.replace('MARKETPLACE', mpName).replace('NAME', shopName);
	}
}
