import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearnMarkdown } from "./LearnMarkdown";
import { MarkdownRenderer } from "../../../components/MarkdownRenderer";

const GLOSSARY_BTN = 'button[class*="cursor-help"]';

describe("LearnMarkdown · GlossaryPopover 接线", () => {
  it("正文段落中首次出现的术语被 GlossaryPopover 包裹", () => {
    const { container } = render(
      <LearnMarkdown content="基差是现货与期货之差。协整检验用于配对交易。" />,
    );
    const tags = container.querySelectorAll(GLOSSARY_BTN);
    expect(tags.length).toBeGreaterThan(0);
  });

  it("术语文案正确", () => {
    render(<LearnMarkdown content="这是基差的解释。" />);
    expect(screen.getByText("基差")).toBeTruthy();
  });

  it("代码块内的术语不被包裹（避免误匹配）", () => {
    const { container } = render(
      <LearnMarkdown content={"```python\n# 基差 = spot - futures\nbasis = 1\n```"} />,
    );
    const tags = container.querySelectorAll(`pre ${GLOSSARY_BTN}`);
    expect(tags.length).toBe(0);
  });

  it("无术语的普通文本不产生术语按钮", () => {
    const { container } = render(
      <LearnMarkdown content="普通的一段话，没有任何术语表里的词。" />,
    );
    const tags = container.querySelectorAll(GLOSSARY_BTN);
    expect(tags.length).toBe(0);
  });

  it("列表项中的术语也被包裹", () => {
    const { container } = render(
      <LearnMarkdown content={"- 基差是期货基础概念\n- 协整是配对交易前提"} />,
    );
    const tags = container.querySelectorAll(GLOSSARY_BTN);
    expect(tags.length).toBeGreaterThan(0);
  });
});

describe("MarkdownRenderer · GlossaryPopover 接线", () => {
  it("新课节渲染器也会自动包裹术语", () => {
    const { container } = render(<MarkdownRenderer content="基差是现货与期货之差。" />);
    expect(container.querySelectorAll(GLOSSARY_BTN).length).toBeGreaterThan(0);
  });
});
