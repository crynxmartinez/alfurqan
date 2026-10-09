// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ScoreInput } from "./score-input";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("preserves a failed score and retries the exact typed value", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Offline" }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ score: 8 }) });
  vi.stubGlobal("fetch", fetcher);
  const saved = vi.fn();
  const dirty = vi.fn();
  render(
    <ScoreInput
      studentId="s"
      itemId="i"
      initialScore={5}
      maxScore={10}
      label="Score"
      onSaved={saved}
      onDirty={dirty}
    />,
  );
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "8" } });
  fireEvent.blur(input);
  await screen.findByText("Offline");
  expect(input.value).toBe("8");
  expect(saved).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Retry my value"));
  await waitFor(() => expect(saved).toHaveBeenCalledWith(8));
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({
    score: 8,
    expectedScore: 5,
  });
  expect(dirty).toHaveBeenLastCalledWith(false);
});
it("serializes edits during a pending save", async () => {
  let finish!: (value: unknown) => void;
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetcher);
  render(
    <ScoreInput
      studentId="s"
      itemId="i"
      initialScore={5}
      maxScore={10}
      label="Score"
      onSaved={() => {}}
      onDirty={() => {}}
    />,
  );
  const input = screen.getByRole("spinbutton");
  fireEvent.change(input, { target: { value: "6" } });
  fireEvent.blur(input);
  fireEvent.change(input, { target: { value: "9" } });
  fireEvent.blur(input);
  expect(fetcher).toHaveBeenCalledTimes(1);
  finish({ ok: true, json: async () => ({}) });
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({
    score: 9,
    expectedScore: 6,
  });
});
