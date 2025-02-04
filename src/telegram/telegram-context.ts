import {OzonApiKeys, WbApiKeys} from '@prisma/client';
import {Context, Scenes} from 'telegraf';
import {IUserApiKey} from '../users/users.interface';

interface SceneSession extends Scenes.SceneSessionData {
	example: number; // TODO: for feature
	cursor: number; // TODO: for feature
}

interface Session extends Scenes.SceneSession<SceneSession> {
	prevMsg: {
		messageId: number;
		chatId: number;
	};
	keys: IUserApiKey[];
	isRegistered: boolean;
	telegramUserId: bigint;
	timezone: string;
	location: string;
	wbApiKeys: WbApiKeys[];
	ozonApiKeys: OzonApiKeys[];
}

export interface MyContext extends Context {
	session: Session;
	match: {
		input: string;
	};
	scene: Scenes.SceneContextScene<MyContext, SceneSession>;
}

export interface CustomMyContext extends Omit<MyContext, 'update'> {
	update: {
		message: {
			contact: {
				user_id: number;
				first_name: string;
				last_name: string;
				phone_number: string;
			};
			from: {
				id: number;
				is_bot: boolean;
				first_name: string;
				last_name: string;
				username: string;
				language_code: 'ru';
			};
			text: string;
		};
	};
	match: {
		input: string;
	};
}
