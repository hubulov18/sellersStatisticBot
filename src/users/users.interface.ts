export interface IUserCreate {
	isRegistered: boolean;
	phone: string;
	wbApiKeys: {
		keyId: string;
		name: string;
	}[];
	ozonApiKeys: {
		keyId: string;
		name: string;
	}[];
	token: string;
}

export interface IUserResponseByPhone {
	error: boolean;
	data: {
		wbApiKeys: {
			keyId: string;
			name: string;
		}[];
		ozonApiKeys: {
			keyId: string;
			name: string;
		}[];
		token: string;
	};
}

export interface IUserResponseByToken {
	error: boolean;
	data: {
		wbApiKeys: {
			keyId: string;
			name: string;
		}[];
		ozonApiKeys: {
			keyId: string;
			name: string;
		}[];
		phone?: string;
	};
}

export interface IUserApiKey {
	keyId: string;
	name: string;
	selected?: boolean;
}

export interface IUserSubscriptionDate {
	error: boolean;
	data: {
		toDate: string;
	};
}
