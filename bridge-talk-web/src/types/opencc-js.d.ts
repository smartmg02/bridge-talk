// src/types/node-opencc.d.ts
declare module 'node-opencc' {
  export class OpenCC {
    constructor(configFile: string);
    convertPromise(text: string): Promise<string>;
  }
}
