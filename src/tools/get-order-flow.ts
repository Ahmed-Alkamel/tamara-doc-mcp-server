export async function getOrderFlow(): Promise<string> {
  return `# Tamara Order Lifecycle

## Status Flow

\`new\` → \`approved\` → \`authorised\` → \`fully_captured\` / \`partially_captured\` → \`fully_refunded\` / \`partially_refunded\`

\`new\` → \`declined\` / \`expired\`

\`authorised\` → \`canceled\` / \`updated\`

---

## Detailed States

### new
Customer has initiated the checkout session with Tamara as a payment method.

### declined
Customer was declined to continue the payment with Tamara.

### expired
- Customer did not complete the payment within 30 minutes of checkout session creation, or
- Order was not authorised within 72 hours of approval, or
- Authorised order was not captured/canceled within 90 days.

### approved
Customer placed a new order and completed the 1st payment successfully.

### authorised
Tamara verified the customer's payment and authorised the order. You can consider the order paid and proceed to capturing once shipped.
> Auto-authorisation supported: if enabled, moves from New → Approved → Authorised automatically.

### fully_captured
Order has been fully shipped/fulfilled by the merchant.
> Auto-capture: if not captured within 21 days of authorisation, Tamara auto-captures.

### partially_captured
Part of the order has been shipped/fulfilled.

### canceled
Order completely canceled before shipping while in authorised status.

### updated (Partially Canceled)
Part of the order canceled before shipping while in authorised status.

### fully_refunded
Order amount fully refunded to the customer at the merchant's request.

### partially_refunded
Part of the order amount refunded to the customer at the merchant's request.

---

## API Endpoints for Each Transition

| Transition | Method | Endpoint |
|---|---|---|
| Check Eligibility | POST | /pre-checkout/v1/eligibility |
| Create Session | POST | /checkout |
| Authorise | POST | /orders/{order_id}/authorise |
| Capture | POST | /payments/capture |
| Cancel | POST | /orders/{order_id}/cancel |
| Refund | POST | /orders/{order_id}/refund |
| Get Details | GET | /orders/{order_id} |
`;
}
