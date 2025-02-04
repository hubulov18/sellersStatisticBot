import {Module} from '@nestjs/common';
import {OzonParserService} from './ozon-parser.service';

@Module({
	providers: [OzonParserService],
	exports: [OzonParserService],
})
export class OzonParserModule {}
