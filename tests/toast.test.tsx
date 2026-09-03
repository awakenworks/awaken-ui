import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ToastProvider, useToast } from "../src/index.js";

function ToastTrigger() {
  const toast = useToast();
  return (
    <button
      onClick={() =>
        toast.push({
          duration: 0,
          message: "Saved",
          tone: "success",
        })
      }
      type="button"
    >
      Show toast
    </button>
  );
}

describe("ToastProvider", () => {
  it("uses consumer-provided labels and supports explicit dismissal", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider
        dismissLabel="Dismiss message"
        regionLabel="Application messages"
      >
        <ToastTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Show toast" }));
    expect(
      screen.getByRole("region", { name: "Application messages" }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Saved");

    await user.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
