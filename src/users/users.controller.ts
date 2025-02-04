import {Body, Controller, Post} from '@nestjs/common';
import {UsersKeyDto} from './dto/users-key.dto';
import {UsersService} from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}

	@Post('ozon/new/key')
	async addOzonApiKey(@Body() data: UsersKeyDto) {
		return this.userService.addOzonApiKey(data);
	}

	@Post('ozon/old/key')
	async removeOzonApiKey(@Body() data: Pick<UsersKeyDto, 'keyId' | 'token'>) {
		return this.userService.removeOzonApiKey(data);
	}

	@Post('wb/new/key')
	async addWbApiKey(@Body() data: UsersKeyDto) {
		return this.userService.addWbApiKey(data);
	}

	@Post('wb/old/key')
	async removeWbApiKey(@Body() data: Pick<UsersKeyDto, 'keyId' | 'token'>) {
		return this.userService.removeWbApiKey(data);
	}
}
