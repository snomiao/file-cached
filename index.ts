import type { PathLike } from "fs";
import path from "path";
import type { FileHandle } from "fs/promises";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

export function FileCacheObj(file: PathLike | FileHandle) {
  return new Proxy({} as any, {
    get: (target, key: string) =>
      Promise.resolve(target[key]).then(
        (e) =>
          e ??
          readFile(file, "utf8")
            .then((e) => Object.assign(target, JSON.parse(e))[key])
            .catch(() => undefined)
      ),
    set: (target, key: string, value: any, receiver) =>
      !!Promise.resolve((target[key] = value)).then((e) =>
        writeFile(file, JSON.stringify({ ...e }, null, 2))
      ),
  });
}

export function FolderCacheObj(folder: string, ext = ".json") {
  return new Proxy({} as any, {
    get: (target, key: string) =>
      Promise.resolve(target[key]).then(
        (e) =>
          e ??
          readFile(path.join(folder, key + ext), "utf8")
            .then((e) => JSON.parse(e))
            .catch(() => undefined)
      ),
    set: (target, key: string, value: any, receiver) =>
      !!Promise.resolve((target[key] = value)).then((e) =>
        writeFile(path.join(folder, key + ext), JSON.stringify(value, null, 2))
      ),
  });
}
