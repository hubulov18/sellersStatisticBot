import {Module} from '@nestjs/common';
import {UtilsModule} from '../utils/utils.module';
import {UserActionService} from './user-action.service';

@Module({
	imports: [UtilsModule],
	providers: [UserActionService],
	exports: [UserActionService],
})
export class UserActionModule {}
