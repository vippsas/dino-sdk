import { proxifyFactory } from "../src/api_proxy.ts";
import { baseClient } from "../src/base_client.ts";
import { assertEquals } from "@std/assert";
import type { RequestData } from "../src/types_internal.ts";

Deno.test("proxifyFactory - Should return a Proxy object with method", () => {
  const client = baseClient({
    merchantSerialNumber: "",
    subscriptionKey: "",
  }, "1.0.0");

  const factory = {
    foo(): RequestData<unknown, unknown> {
      return {
        method: "GET",
        url: "/foo",
      };
    },
  };

  const api = proxifyFactory(client, factory);
  assertEquals(typeof api, "object");
  assertEquals(typeof api.foo, "function");
});

Deno.test("proxifyFactory - Should return the original property if it is not a function", () => {
  const client = baseClient({
    merchantSerialNumber: "",
    subscriptionKey: "",
  }, "1.0.0");

  const factory = {
    foo(): RequestData<unknown, unknown> {
      return {
        method: "GET",
        url: "/foo",
      };
    },
    bar: "bar",
  };

  // deno-lint-ignore no-explicit-any
  const api = proxifyFactory(client, factory as any);

  assertEquals(typeof api, "object");
  assertEquals(api.bar, "bar" as unknown);
});
