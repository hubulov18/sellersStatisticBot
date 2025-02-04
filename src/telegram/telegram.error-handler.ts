import {MyContext} from './telegram-context';

export default (fn: (ctx: MyContext) => Promise<unknown>) => {
	return async function (ctx: MyContext, next: () => unknown) {
		try {
			return await fn(ctx);
		} catch (error) {
			console.log('Error handler message', (error as Error).message);
			await ctx.reply('Произошла ошибка. Попробуйте снова');
			await ctx.scene.leave();
			return next();
		}
	};
};
