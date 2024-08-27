import { sleep } from "bun";
import { mkdir, readFile, rm, stat, unlink } from "fs/promises";
import { F } from "rambda";
import { cachedInFile } from ".";
import curry from "just-curry-it";
await mkdir("cache", { recursive: true });
it("caches object into one json file", async () => {
  const file = import.meta.dir + "/cache/cache.json";

  // clean, start from "./.cache.json" not existed
  await unlink(file).catch(F);
  expect(await stat(file).catch(F)).toBeFalsy();

  await unlink(file).catch(F);
  expect(await cachedInFile({ file }, () => "asdfzxcv")()).toBe("asdfzxcv");
  expect(await cachedInFile({ file }, () => "qwerasdf")()).toBe("asdfzxcv");

  await unlink(file).catch(F);
  expect(await cachedInFile({ file }, (s: string) => s + "zxcv")("asdf")).toBe(
    "asdfzxcv"
  );
  expect(await cachedInFile({ file }, (s: string) => s + "qwer")("asdf")).toBe(
    "asdfzxcv"
  );

  await unlink(file).catch(F);
  expect(
    await cachedInFile({ file }, async (s: string) => s + "zxcv")("asdf")
  ).toBe("asdfzxcv");
  expect(
    await cachedInFile({ file }, async (s: string) => s + "zxcv")("qwer")
  ).toBe("asdfzxcv");
  await unlink(file).catch(F);
});
