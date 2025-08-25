console.log('🔧 Stripe Environment Setup Guide\n');

console.log('To enable Stripe payments, you need to add these environment variables:\n');

console.log('1. Add to your .env file:');
console.log('   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here');
console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here\n');

console.log('2. Add to your Vercel environment variables:');
console.log('   Go to Vercel Dashboard > Your Project > Settings > Environment Variables');
console.log('   Add the same variables there for production.\n');

console.log('3. Get your Stripe keys from:');
console.log('   https://dashboard.stripe.com/apikeys\n');

console.log('4. For testing, use these test card numbers:');
console.log('   - 4242 4242 4242 4242 (Visa)');
console.log('   - 4000 0000 0000 0002 (Visa - declined)');
console.log('   - Expiry: Any future date');
console.log('   - CVC: Any 3 digits\n');

console.log('5. After adding the environment variables, redeploy your application.\n');

console.log('✅ Payment system will be ready once Stripe keys are configured!');
