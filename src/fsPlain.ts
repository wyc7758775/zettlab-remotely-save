import cloneDeep from "lodash/cloneDeep";
import type { Entity } from "./baseTypes";
import { FakeFs } from "./fsAll";

export interface PlainRemoteCheck {
  ok: true;
  reason: "plain_remote";
}

/**
 * The historic sync engine expects a transform layer. This layer deliberately
 * performs no encryption: Zettlab's NAS agent needs readable Markdown.
 */
export class PlainRemoteFs extends FakeFs {
  readonly innerFs: FakeFs;
  readonly kind: string;

  constructor(innerFs: FakeFs) {
    super();
    this.innerFs = innerFs;
    this.kind = `plain(${innerFs.kind})`;
  }

  private toPlain(entity: Entity): Entity {
    const result = cloneDeep(entity);
    result.key = result.key ?? result.keyRaw;
    result.keyEnc = result.keyRaw;
    result.sizeEnc = result.sizeRaw;
    return result;
  }

  async isPasswordOk(): Promise<PlainRemoteCheck> {
    return { ok: true, reason: "plain_remote" };
  }

  async encryptEntity(entity: Entity): Promise<Entity> {
    return this.toPlain(entity);
  }

  async walk(): Promise<Entity[]> {
    return (await this.innerFs.walk()).map((entity) => this.toPlain(entity));
  }

  async walkPartial(): Promise<Entity[]> {
    return (await this.innerFs.walkPartial()).map((entity) => this.toPlain(entity));
  }

  async stat(key: string): Promise<Entity> { return this.toPlain(await this.innerFs.stat(key)); }
  async mkdir(key: string, mtime?: number, ctime?: number): Promise<Entity> { return this.toPlain(await this.innerFs.mkdir(key, mtime, ctime)); }
  async writeFile(key: string, content: ArrayBuffer, mtime: number, ctime: number): Promise<Entity> { return this.toPlain(await this.innerFs.writeFile(key, content, mtime, ctime)); }
  async readFile(key: string): Promise<ArrayBuffer> { return this.innerFs.readFile(key); }
  async rename(key1: string, key2: string): Promise<void> { await this.innerFs.rename(key1, key2); }
  async rm(key: string): Promise<void> { await this.innerFs.rm(key); }
  async checkConnect(callbackFunc?: unknown): Promise<boolean> { return this.innerFs.checkConnect(callbackFunc); }
  async getUserDisplayName(): Promise<string> { return this.innerFs.getUserDisplayName(); }
  async revokeAuth(): Promise<unknown> { return this.innerFs.revokeAuth(); }
  allowEmptyFile(): boolean { return this.innerFs.allowEmptyFile(); }
  async closeResources(): Promise<void> {}
}
