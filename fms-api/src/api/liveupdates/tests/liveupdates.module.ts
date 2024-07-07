import { Test } from '@nestjs/testing';
import { LiveUpdateModule } from '../liveupdates.module';
import { LiveUpdateGateway } from '../liveupdates.gateway';
import { LiveUpdateService } from '../liveupdates.service';

describe('LiveUpdateModule', () => {
  let liveUpdateModule: LiveUpdateModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LiveUpdateModule],
    }).compile();

    liveUpdateModule = moduleRef.get<LiveUpdateModule>(LiveUpdateModule);
  });

  it('should be defined', () => {
    expect(liveUpdateModule).toBeDefined();
  });

  it('should provide LiveUpdateGateway', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LiveUpdateModule],
    }).compile();

    const liveUpdateGateway =
      moduleRef.get<LiveUpdateGateway>(LiveUpdateGateway);
    expect(liveUpdateGateway).toBeDefined();
    expect(liveUpdateGateway).toBeInstanceOf(LiveUpdateGateway);
  });

  it('should provide LiveUpdateService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LiveUpdateModule],
    }).compile();

    const liveUpdateService =
      moduleRef.get<LiveUpdateService>(LiveUpdateService);
    expect(liveUpdateService).toBeDefined();
    expect(liveUpdateService).toBeInstanceOf(LiveUpdateService);
  });

  it('should export LiveUpdateGateway', async () => {
    const testModule = await Test.createTestingModule({
      imports: [LiveUpdateModule],
    }).compile();

    expect(testModule.get(LiveUpdateGateway)).toBeDefined();
  });

  it('should export LiveUpdateService', async () => {
    const testModule = await Test.createTestingModule({
      imports: [LiveUpdateModule],
    }).compile();

    expect(testModule.get(LiveUpdateService)).toBeDefined();
  });
});
