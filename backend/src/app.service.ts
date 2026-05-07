import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: 'NeuroTrack API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
