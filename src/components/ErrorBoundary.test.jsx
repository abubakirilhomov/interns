import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
// Переводы в тестах не поднимаем: проверяем поведение границы ошибок, а не
// содержимое словарей. `t` возвращает сам ключ — по нему и проверяем.
vi.mock("react-i18next", () => ({
  withTranslation: () => (C) => (props) => <C {...props} t={(k) => k} />,
}));

import ErrorBoundary from "./ErrorBoundary.jsx";

const Boom = ({ msg = "разорвало рендер" }) => { throw new Error(msg); };

let spy;
beforeEach(() => {
  // React сам печатает пойманную ошибку — глушим, чтобы вывод тестов читался.
  spy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => spy.mockRestore());

describe("ErrorBoundary", () => {
  it("пропускает детей, когда всё в порядке", () => {
    render(<ErrorBoundary><p>живой контент</p></ErrorBoundary>);
    expect(screen.getByText("живой контент")).toBeTruthy();
  });

  it("ловит ошибку рендера и показывает запасной интерфейс вместо белого экрана", () => {
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByText("errors.somethingWrong")).toBeTruthy();
    expect(screen.getByRole("button", { name: "errors.reload" })).toBeTruthy();
  });

  it("показывает текст ошибки — без него чинить по скриншоту невозможно", () => {
    render(<ErrorBoundary><Boom msg="TypeError: cannot read x of undefined" /></ErrorBoundary>);
    expect(screen.getByText(/cannot read x of undefined/)).toBeTruthy();
  });

  it("кнопка перезагружает страницу", () => {
    const reload = vi.fn();
    const orig = window.location;
    delete window.location;
    window.location = { ...orig, reload };
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    screen.getByRole("button", { name: "errors.reload" }).click();
    expect(reload).toHaveBeenCalled();
    window.location = orig;
  });

  it("после падения дети больше не рендерятся", () => {
    render(<ErrorBoundary><Boom /><p>не должно быть видно</p></ErrorBoundary>);
    expect(screen.queryByText("не должно быть видно")).toBeNull();
  });
});
