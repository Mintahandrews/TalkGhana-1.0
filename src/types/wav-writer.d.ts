declare module 'wav' {
  import { Writable } from 'stream';

  export class FileWriter extends Writable {
    constructor(
      path: string,
      options?: {
        channels?: number;
        sampleRate?: number;
        bitDepth?: number;
      }
    );
    
    on(event: 'done', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}
