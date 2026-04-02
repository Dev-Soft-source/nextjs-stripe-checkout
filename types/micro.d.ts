declare module 'micro' {
  import type { IncomingMessage } from 'http';
  export function buffer(req: IncomingMessage): Promise<Buffer>;
}
