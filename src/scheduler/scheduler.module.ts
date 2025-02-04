import {Module} from '@nestjs/common';
import {UsersModule} from '../users/users.module';
import {SchedulerService} from './scheduler.service';

@Module({
	imports: [UsersModule],
	providers: [SchedulerService],
	exports: [SchedulerService],
})
export class SchedulerModule {}
