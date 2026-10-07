import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";

export const HeadlessDialog = Dialog;
export const HeadlessAlertDialog = AlertDialog;

/** One package-owned refusal contract for all modal presentations. The
 * existing engine must not process focus/dismissal for a declined transition. */
export function modalOpenChange(callback: (open: boolean) => unknown) {
  return (open: boolean, details: { cancel: () => void }) => {
    if (callback(open) === false) details.cancel();
  };
}
