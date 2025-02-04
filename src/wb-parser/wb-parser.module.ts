import {Module} from '@nestjs/common';
import {WbParserService} from './wb-parser.service';

@Module({
	providers: [WbParserService],
	exports: [WbParserService],
})
export class WbParserModule {}
