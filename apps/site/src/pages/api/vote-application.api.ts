import { createBaseHandler } from "../../lib/api/handler/base-handler";
import { getMember, subscribeToMailchimp } from "../../lib/api/mailchimp";

export type VoteApplicationRequestBody = {
  email: string;
  merge_fields?: { [key: string]: any };
};

export type VoteApplicationResponse = {
  success?: boolean;
  error?: boolean;
};

export default createBaseHandler<
  VoteApplicationRequestBody,
  VoteApplicationResponse
>().put(async (req, res) => {
  const member = await getMember({ email: req.body.email })
    .then((res) => ({
      id: res.id,
      email: res.email_address,
      merge_fields: res.merge_fields,
    }))
    .catch(() => {
      return res.status(400).send({ error: true });
    });

  const payload = { ...req.body };
  if (member?.merge_fields?.WISH_EA && payload?.merge_fields?.WISH_EA) {
    payload.merge_fields.WISH_EA = `${member?.merge_fields?.WISH_EA}, ${payload.merge_fields.WISH_EA}`;
  }

  return await subscribeToMailchimp(payload)
    .then(() => {
      return res.json({ success: true });
    })
    .catch(() => {
      return res.status(400).send({ error: true });
    });
});