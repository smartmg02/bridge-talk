declare module 'node-opencc' {
  class OpenCC {
    constructor(config?: string);

    convertSync(text: string): string;
    convertPromise(text: string): Promise<string>;
  }

  export = OpenCC;
}
