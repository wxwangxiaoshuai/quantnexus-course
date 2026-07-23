import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LessonContent } from "./LessonContent";

describe("LessonContent", () => {
  it("shows readable Chinese when an interactive component is unavailable", () => {
    render(
      <LessonContent
        blocks={[{ type: "interactive", componentId: "position-sizing-demo" }]}
      />,
    );

    expect(screen.getByText("交互组件「position-sizing-demo」暂未加载")).toBeTruthy();
    expect(
      screen.getByText("该课时的交互演示尚未注册，请稍后重试或联系管理员。"),
    ).toBeTruthy();
  });
});
