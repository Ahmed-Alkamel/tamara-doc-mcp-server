export async function getWebhookEvents(): Promise<string> {
  return `# Tamara Webhook Events

## Registration
Register your webhook URL in the Tamara Partners Portal:
1. Login to https://partners.tamara.co
2. Go to Settings → General Settings → Webhooks
3. Click "Add webhooks"
4. Choose Type: "Order"
5. Select Events to subscribe to
6. Enter your webhook URL (HTTPS only, max 255 chars)

## Authentication
Tamara sends a JWT token (HS256) in:
- Query parameter: \`?tamaraToken=<jwt>\`
- Authorization header: \`Bearer <jwt>\`

Use your **Notification Token** to decode and verify the JWT.

## Event Types

### order_approved
\`\`\`json
{
  "order_id": "4fdb781f-5e13-4ae2-9dc6-3ee49e3878a3",
  "order_reference_id": "4464602579098",
  "order_number": "90001860",
  "event_type": "order_approved",
  "data": []
}
\`\`\`

### order_authorised
\`\`\`json
{
  "order_id": "4fdb781f-5e13-4ae2-9dc6-3ee49e3878a3",
  "order_reference_id": "4464602579098",
  "order_number": "90001860",
  "event_type": "order_authorised",
  "data": []
}
\`\`\`

### order_captured
\`\`\`json
{
  "order_id": "4fdb781f-5e13-4ae2-9dc6-3ee49e3878a3",
  "order_reference_id": "4464602579098",
  "order_number": "90001860",
  "event_type": "order_captured",
  "data": {
    "capture_id": "14c594f8-84ec-4f45-8fec-6ef1e2fde2ff",
    "captured_amount": { "amount": 300.00, "currency": "SAR" }
  }
}
\`\`\`

### order_canceled
\`\`\`json
{
  "order_id": "4fdb781f-5e13-4ae2-9dc6-3ee49e3878a3",
  "order_reference_id": "4464602579098",
  "order_number": "90001860",
  "event_type": "order_canceled",
  "data": {}
}
\`\`\`

### order_refunded
\`\`\`json
{
  "order_id": "4fdb781f-5e13-4ae2-9dc6-3ee49e3878a3",
  "order_reference_id": "4464602579098",
  "order_number": "90001860",
  "event_type": "order_refunded",
  "data": {
    "refund_id": "...",
    "refunded_amount": { "amount": 300.00, "currency": "SAR" }
  }
}
\`\`\`

### order_expired
\`\`\`json
{
  "order_id": "...",
  "order_reference_id": "...",
  "order_number": "...",
  "event_type": "order_expired",
  "data": []
}
\`\`\`

### order_declined
\`\`\`json
{
  "order_id": "...",
  "order_reference_id": "...",
  "order_number": "...",
  "event_type": "order_declined",
  "data": []
}
\`\`\`

## Important Note
Webhooks provide server-to-server communication that helps avoid frontend redirection issues. Even if the customer is not redirected back to your site after payment, your system still receives the notification.
`;
}
