import {IsString} from 'class-validator';

export class UsersKeyDto {
	@IsString()
	keyId!: string;

	@IsString()
	name!: string;

	@IsString()
	token!: string;
}
