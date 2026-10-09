// @vitest-environment jsdom
import React, { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";
import { PasswordInput } from "./PasswordInput";
afterEach(cleanup);
it("keeps input focus through every keystroke and toggles password visibility", async () => {
  function Form() {
    const [name, setName] = useState("");
    return (
      <Modal title="Teacher" onClose={() => {}}>
        <input
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PasswordInput aria-label="Password" />
      </Modal>
    );
  }
  const user = userEvent.setup();
  render(<Form />);
  const name = screen.getByLabelText("Name") as HTMLInputElement;
  await user.type(name, "Teacher Example");
  expect(name.value).toBe("Teacher Example");
  expect(document.activeElement).toBe(name);
  const password = screen.getByLabelText("Password") as HTMLInputElement;
  await user.type(password, "test-only-password");
  expect(password.type).toBe("password");
  await user.click(screen.getByLabelText("Show password"));
  expect(password.type).toBe("text");
  expect(password.value).toBe("test-only-password");
});
