import {
  FormEvent,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiClient } from "../../../../lib/api-client";
import { useEmailTextField } from "../../../hooks/use-email-text-field";
import { Input } from "../input";
import { ApplicationId } from "./applications";

const submitErrorText = "There was an error submitting your email";

export interface VoteEmailInputProps {
  applicationId: ApplicationId;
  suggestionName?: string;
  onSubmit: () => void;
  onError?: () => void;
}

export const VoteEmailInput: FunctionComponent<VoteEmailInputProps> = ({
  applicationId,
  suggestionName,
  onSubmit,
  onError,
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    emailValue,
    setEmailValue,
    isEmailValid: isEmailInputValid,
    emailHelperText,
  } = useEmailTextField({});

  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [touchedEmailInput, setTouchedEmailInput] = useState<boolean>(false);

  const helperText = touchedEmailInput ? emailHelperText : undefined;

  const isEmailInvalid = !isEmailInputValid;

  const displayError = touchedEmailInput && isEmailInvalid;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedEmailInput(true);

    if (isEmailInputValid) {
      setLoading(true);
      await apiClient
        .submitApplicationVote({
          email: emailValue,
          vote: applicationId,
          other: suggestionName,
        })
        .then(({ data }) => {
          setSubmitError(false);
          setLoading(false);

          if (data?.success) {
            onSubmit();
          } else {
            setSubmitError(true);
          }
        });
    }
  };

  useEffect(() => {
    if (touchedEmailInput && (displayError || !isEmailInputValid)) {
      onError?.();
    }
  }, [onError, displayError, touchedEmailInput, isEmailInputValid]);

  return (
    <Input
      disabled={loading}
      displayError={displayError}
      error={displayError || submitError}
      helperText={submitError ? submitErrorText : helperText}
      inputRef={emailInputRef}
      placeholder="name@example.com"
      value={emailValue}
      onChange={({ target }) => {
        setSubmitError(false);
        setEmailValue(target.value);
      }}
      buttonLabel="Submit vote"
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
};
