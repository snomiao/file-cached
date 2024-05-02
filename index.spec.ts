import { MD5, sleep } from "bun";
import { FileCacheObj, FolderCacheObj } from ".";
import { rm, watch, stat, readFile, unlink } from "fs/promises";
import { F, type Fn } from "rambda";

// const waitFor = async <R>(fn: Fn<void, Promise<R>>, r: R) => {
//   while (!(r = (await fn().catch(F)) as R));
//   return r;
// };

it("caches object into one json file", async () => {
  const file = import.meta.dir + "/.cache.json";

  // clean, start from "./.cache.json" not existed
  await unlink(file).catch(F);
  expect(await stat(file).catch(F)).toBeFalsy();

  // init
  const cachedContent = async () => JSON.parse(await readFile(file, "utf8"));
  const obj = FileCacheObj(file);
  expect(obj["abc"]).resolves.toBe(undefined); //

  // store 123
  obj["abc"] = 123;
  expect(obj["abc"]).toHaveProperty("then"); // is promise
  expect(obj["abc"]).resolves.toBe(123);

  // todo replace with ...
  await sleep(10);
  expect(await cachedContent()).toEqual({ abc: 123 });

  obj["def"] = "456";
  expect(obj["def"]).resolves.toBe("456"); //

  await sleep(10);
  expect(await cachedContent()).toEqual({ abc: 123, def: "456" });

  //   await stat('./.cache.json').catch(F)
});

it("caches values into seperated json files", async () => {
  const dir = import.meta.dir + "/.cache";

  // clean, start from "./.cache/" not existed
  await rm(dir, { force: true, recursive: true }).catch(F);
  expect(await stat(dir).catch(F)).toBeFalsy();

  // init
  const cachedContent = async (key: string) =>
    JSON.parse(await readFile(dir + "/" + key + ".json", "utf8"));
  const obj = FolderCacheObj(dir);
  expect(obj["abc"]).resolves.toBe(undefined); //

  // store 123
  obj["abc"] = 123;
  expect(obj["abc"]).toHaveProperty("then"); // is promise
  expect(obj["abc"]).resolves.toBe(123);

  // todo replace with ...
  await sleep(10);
  expect(await cachedContent("abc")).toEqual(123);

  obj["def"] = "456";
  expect(obj["def"]).resolves.toBe("456"); //

  await sleep(10);
  expect(await cachedContent("abc")).toEqual(123);
  expect(await cachedContent("def")).toEqual("456");

  //   await stat('./.cache.json').catch(F)
});
