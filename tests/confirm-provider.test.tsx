import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import {
  ConfirmProvider,
  useConfirm,
  type Confirm,
} from "../src/index.js";

function Requester({
  expose,
  results,
}: {
  expose: (confirm: Confirm) => void;
  results: boolean[];
}) {
  const confirm = useConfirm();
  expose(confirm);
  return (
    <button
      onClick={() => {
        void confirm({
          cancelLabel: "Cancel",
          confirmLabel: "Continue",
          title: "Continue?",
        }).then((result) => results.push(result));
      }}
      type="button"
    >
      Request
    </button>
  );
}

describe("ConfirmProvider", () => {
  it("serializes concurrent requests and settles each exactly once", async () => {
    const user = userEvent.setup();
    const results: boolean[] = [];
    let confirm: Confirm | undefined;
    render(
      <ConfirmProvider>
        <Requester expose={(value) => (confirm = value)} results={results} />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Request" }));
    void confirm?.({
      cancelLabel: "No",
      confirmLabel: "Yes",
      title: "Second?",
    }).then((result) => results.push(result));

    expect(screen.getByRole("alertdialog", { name: "Continue?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alertdialog", { name: "Second?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "No" }));

    await vi.waitFor(() => expect(results).toEqual([true, false]));
  });

  it("settles an active request as cancelled when the provider unmounts", async () => {
    const user = userEvent.setup();
    const results: boolean[] = [];

    function Harness({ mounted }: { mounted: boolean }) {
      return (
        mounted ? (
          <ConfirmProvider>
            <Requester expose={() => undefined} results={results} />
          </ConfirmProvider>
        ) : null
      );
    }

    const view = render(<Harness mounted />);
    await user.click(screen.getByRole("button", { name: "Request" }));
    view.rerender(<Harness mounted={false} />);

    await vi.waitFor(() => expect(results).toEqual([false]));
  });
});
