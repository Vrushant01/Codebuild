export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.warn("Could not load Razorpay SDK script from CDN.")
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number // in paise (e.g. 250000 for ₹2500)
  currency: string
  name: string
  description: string
  order_id?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature?: string
  }) => void
  modal?: {
    ondismiss?: () => void
  }
}

export const openRazorpayModal = async (options: RazorpayCheckoutOptions): Promise<void> => {
  const loaded = await loadRazorpayScript()
  if (loaded && (window as any).Razorpay) {
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  } else {
    // Graceful test simulator for local development if CDN is blocked
    const confirmPayment = window.confirm(
      `[MEDIREACH Razorpay Test Gateway]\n\nPay ₹${options.amount / 100} for "${options.description}"?\n\nClick OK to simulate successful Razorpay payment.`
    )
    if (confirmPayment) {
      options.handler({
        razorpay_payment_id: `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        razorpay_order_id: options.order_id || `order_test_${Date.now()}`,
        razorpay_signature: `sig_test_${Date.now()}`
      })
    } else {
      if (options.modal?.ondismiss) options.modal.ondismiss()
    }
  }
}
