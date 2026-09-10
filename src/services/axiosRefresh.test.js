import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Перехватчик вешается на глобальный axios и дёргает store — подменяем оба.
vi.mock("axios", () => {
  const handlers = [];
  return {
    default: {
      interceptors: { response: { use: (ok, err) => handlers.push({ ok, err }) } },
      __handlers: handlers,
    },
  };
});

const setupAxios = (await import("./axiosRefresh.js")).default;

const store = { getState: () => ({ auth: {} }), dispatch: vi.fn() };
let onError;

beforeEach(() => {
  axios.__handlers.length = 0;
  setupAxios(store);
  onError = axios.__handlers[0].err;
});

const err401 = (url) => ({ response: { status: 401 }, config: { url, _retry: false } });

describe("перехватчик обновления токена", () => {
  // Это не косметика: попытка обновить токен на упавшем /refresh-token
  // рекурсивно входит в этот же перехватчик и встаёт намертво — пользователь
  // видит вечную загрузку. Симптом уже наблюдался в Safari с ITP.
  it.each(["/mentors/refresh-token", "/api/interns/refresh-token"])(
    "не пытается обновлять токен на самом %s", async (url) => {
      await expect(onError(err401(url))).rejects.toBeDefined();
    });

  it.each(["/api/interns/login", "/api/mentors/login", "/api/interns/logout"])(
    "не обновляет токен на %s — там 401 это ответ, а не протухание", async (url) => {
      await expect(onError(err401(url))).rejects.toBeDefined();
    });

  it("не-401 пробрасывается как есть", async () => {
    const e = { response: { status: 500 }, config: { url: "/api/x" } };
    await expect(onError(e)).rejects.toBe(e);
  });

  it("ошибка без ответа (обрыв сети) пробрасывается и не роняет перехватчик", async () => {
    const e = { config: { url: "/api/x" }, message: "Network Error" };
    await expect(onError(e)).rejects.toBe(e);
  });
});
