import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppConfigService} from './app-config.service';
import {PrismaService} from './prisma.service';
import {UtilsService} from './utils.service';

@Module({
	imports: [ConfigModule],
	providers: [PrismaService, AppConfigService, UtilsService],
	exports: [PrismaService, AppConfigService, UtilsService],
})
export class UtilsModule {}
