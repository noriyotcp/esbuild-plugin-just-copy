import { hello } from "../src/index";

test("returns a message", () => {
  expect(hello("hoge")).toBe("message is hoge");
});
