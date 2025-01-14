import { baseClient } from "../src/base_client.ts";
import { assertEquals } from "@std/assert";
import * as mf from "@hongminhee/deno-mock-fetch";
import type { RequestData } from "../src/types_internal.ts";

Deno.test("makeRequest - Should return ok", async () => {
  mf.install(); // mock out calls to `fetch`

  mf.mock("GET@/foo", (req: Request) => {
    assertEquals(req.url, "https://api.vipps.no/foo");
    assertEquals(req.method, "GET");
    return new Response(JSON.stringify({}), {
      status: 200,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/foo",
  };

  const client = baseClient(cfg, "1.0.0");
  const response = await client.makeRequest(requestData);

  assertEquals(response.ok, true);
});

Deno.test("makeRequest - Should return ok with retrires", async () => {
  mf.install(); // mock out calls to `fetch`

  mf.mock("GET@/foo", (req: Request) => {
    assertEquals(req.url, "https://api.vipps.no/foo");
    assertEquals(req.method, "GET");
    return new Response(JSON.stringify({}), {
      status: 200,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    retryRequests: true,
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/foo",
  };

  const client = baseClient(cfg, "1.0.0");
  const response = await client.makeRequest(requestData);

  assertEquals(response.ok, true);
});

Deno.test("makeRequest - Should error", async () => {
  mf.install(); // mock out calls to `fetch`

  mf.mock("GET@/foo", () => {
    return new Response(JSON.stringify({ ok: false, error: "Bad Request" }), {
      status: 400,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/foo",
  };

  const client = baseClient(cfg, "1.0.0");
  const response = await client.makeRequest(requestData);

  assertEquals(response.ok, false);
});

Deno.test("makeRequest - Should return validation error", async () => {
  mf.install(); // mock out calls to `fetch`

  mf.mock("GET@/epayment/v1/test/payments/123abc/approve", () => {
    return new Response(JSON.stringify({ ok: false, error: "Bad Request" }), {
      status: 400,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    useTestMode: false,
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/epayment/v1/test/payments/123abc/approve",
  };

  const client = baseClient(cfg, "1.0.0");
  const response = await client.makeRequest(requestData);

  assertEquals(response.ok, false);
});

Deno.test("makeRequest - Should return ok after 2 retries", async () => {
  mf.install(); // mock out calls to `fetch`
  let count = 0;
  mf.mock("GET@/foo", () => {
    count++;
    if (count < 3) {
      return new Response(
        JSON.stringify({ ok: false, error: "Internal Server Error" }),
        {
          status: 500,
        },
      );
    }

    return new Response(JSON.stringify({}), {
      status: 200,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    retryRequests: true,
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/foo",
  };

  const client = baseClient(cfg, "1.0.0");

  const response = await client.makeRequest(requestData);
  assertEquals(response.ok, true);

  mf.reset();
});

Deno.test("makeRequest - Should not return ok after 3 retries", async () => {
  mf.install(); // mock out calls to `fetch`
  let count = 0;
  mf.mock("GET@/foo", () => {
    count++;
    if (count < 4) {
      return new Response(
        JSON.stringify({ ok: false, error: "Internal Server Error" }),
        {
          status: 500,
        },
      );
    }
    return new Response(JSON.stringify({}), {
      status: 200,
    });
  });

  const cfg = {
    merchantSerialNumber: "",
    subscriptionKey: "",
    retryRequests: true,
    version: "1.0.0",
  };
  const requestData: RequestData<unknown, unknown> = {
    method: "GET",
    url: "/foo",
  };

  const client = baseClient(cfg, "1.0.0");

  const response = await client.makeRequest(requestData);
  assertEquals(response.ok, false);

  mf.reset();
});
