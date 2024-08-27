# file-cached

Simply cache your object in ./cache.json file.

[![Release](https://github.com/snomiao/file-cached/actions/workflows/release.yml/badge.svg)](https://github.com/snomiao/file-cached/actions/workflows/release.yml)

## Usage Example

### Caching a fetcher function

Here’s a practical example of how you can use the `cachedInFile` function. Let’s say you have a function that fetches data from a remote API, and you want to cache the result to a file to avoid making repeated API calls within a certain time-to-live (TTL) period.

1. First, let’s assume you have an async function `fetcher` that retrieves data from an API:

```ts
async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

2. Now, we'll use the `cachedInFile` function to wrap the `fetcher` function so that the results are cached in a file:

```ts
import { cachedInFile } from 'file-cached'; // Adjust import path as necessary
import path from 'path';

const cachedFetcher = cachedInFile(
  {
    file: path.resolve(__dirname, 'cache.json'), // File to cache the data
    ttl: 60000 // Time-to-live: 60 seconds
  },
  fetcher
);

// Now you can call the cachedFetcher function:
async function main() {
  const url = 'https://jsonplaceholder.typicode.com/posts/1';
  
  // This will call `fetcher` and then cache the result in 'cache.json'
  const data1 = await cachedFetcher(url);
  console.log(data1);

  // If you call it again within the TTL, it will return the cached result instead of making another API call
  const data2 = await cachedFetcher(url);
  console.log(data2);

  // Wait for TTL to expire, then it will fetch new data from the API and update the cache
  setTimeout(async () => {
    const data3 = await cachedFetcher(url);
    console.log(data3);
  }, 61000); // Wait for 61 seconds to make sure TTL has expired
}

main().catch(console.error);
```

## Spec

Check spec here [./index.spec.ts](./index.spec.ts)

