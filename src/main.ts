import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {TelegramService} from './telegram/telegram.service';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	await app.listen(4001, async () => {
		console.log('bot started on port 4001');
		const tgService = app.get(TelegramService);
		await tgService.launchBot();
	});
}

bootstrap().catch((err) => {
	console.log(err);
});
