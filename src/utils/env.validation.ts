import {plainToClass} from 'class-transformer';
import {IsNumber, IsString, validateSync} from 'class-validator';

class EnvironmentVariables {
	@IsString()
	DATABASE_URL!: string;

	@IsString()
	BOT_TOKEN!: string;

	@IsString()
	BASE_URL_SHOPSTAT!: string;

	@IsString()
	SECRET_BOT_KEY!: string;

	@IsString()
	REDIS_HOST!: string;

	@IsNumber()
	REDIS_PORT!: number;

	@IsString()
	REDIS_PASSWORD!: string;
}

export function envValidate(config: Record<string, unknown>) {
	const validatedConfig = plainToClass(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		for (const error of errors) {
			console.log(error.value, error.property);
		}

		throw new Error(errors.toString());
	}

	return validatedConfig;
}
