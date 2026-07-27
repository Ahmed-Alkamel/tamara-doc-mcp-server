export async function getWidgetGuide(platform: string): Promise<string> {
  const p = platform.toLowerCase().trim();

  switch (p) {
    case 'web':
    case 'website':
      return webGuide();
    case 'mobile':
    case 'flutter':
    case 'react-native':
    case 'android':
    case 'ios':
      return mobileGuide();
    default:
      return `Unknown platform: "${platform}". Supported: web, mobile, flutter, react-native, android, ios`;
  }
}

function webGuide(): string {
  return `# Tamara Widgets — Web Implementation

## What are Widgets?
Widgets are lightweight JavaScript promotional messages that inform customers about Tamara payment options.

## Widget Placement

### Product Details Page (PDP)
- **Position**: Below product price, above "Add to Cart" button
- **Properties required**: Language, Country, Public Key, Product amount
- **Widget type**: "Product Page"

### Cart Page
- **Position**: Shows available payment plans based on cart total
- **Same properties** as PDP widget
- Reflects overall cart value

### Checkout Page
- **Position**: Payment options step
- **Widget type**: "Single Checkout Page"
- **Widget Size**: Full variant

## Implementation Steps

### 1. Get Your Public Key
- Sandbox: from the sandbox credentials email
- Production: from Partners Portal → API Credentials
- Or email: integrations@tamara.co

### 2. Use the Interactive Widget Docs
- Sandbox: https://widget-docs-testing.tamara.co/tamara-summary
- Production: https://widget-docs.tamara.co/tamara-summary

### 3. Required Parameters
- Language (e.g., en, ar)
- Country (e.g., SA, AE)
- Public Key
- Amount (product/cart total)

### 4. Rendering
- **Web**: Use the generated JavaScript embed code
- **Mobile Web**: Same JS, responsive by default
- **WebView**: Use the CDN URL returned for "Webview - Mobile"

## Benefits
- 41% increase in average order value
- 30% increase in conversion
- Always up-to-date and compliant messaging

## Regional Guidelines
- KSA: https://docs.tamara.co/docs/tamara-widget-implementation-guidelines-saudi-arabia
- UAE: https://docs.tamara.co/docs/tamara-widget-implementation-guidelines-uae
`;
}

function mobileGuide(): string {
  return `# Tamara Widgets — Mobile Implementation

## Supported SDKs

### Flutter
- Package: tamara_flutter_sdk
- Source: https://pub.dev/packages/tamara_flutter_sdk

### React Native
- Package: react-native-tamara-sdk
- Source: https://www.npmjs.com/package/react-native-tamara-sdk

### Android (Native)
- Example: https://github.com/Tamara-Technology/android-sdk-example

### iOS (Native)
- Standard SDK integration flow
- Download from official SDK channels

## Widget Integration for Mobile Apps

### Using WebView
Use the CDN URL from the Interactive Widget Docs:
1. Go to https://widget-docs.tamara.co/tamara-summary (Production)
2. Set your parameters (language, country, public key, amount)
3. Select "Widget type" → "Product Page" or "Single Checkout Page"
4. Copy the "Webview - Mobile" CDN URL
5. Load this URL in your app's WebView

### Using Native SDKs
The mobile SDKs provide native widget components for:
- Product page widget
- Cart page widget
- Checkout widget

## Checkout Flow for Mobile

### Flutter
1. Call Laravel API to create checkout session
2. Receive checkout_url from backend
3. Open checkout_url in WebView or redirect to Tamara app
4. Handle callback URLs (success, failure, cancel)

### React Native
Same flow as Flutter, using the react-native-tamara-sdk for widget display and deep linking.

## Regional Guidelines
- KSA: Follow Nafath ID verification if required
- UAE: Follow Uqudo/KYC ID verification if required
`;
}
