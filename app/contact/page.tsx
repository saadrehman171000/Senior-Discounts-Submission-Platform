import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-black">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-black">Email</h3>
                      <p className="text-slate-700">
                        <a href="mailto:contact@seniordiscounts.com" className="text-amber-600 hover:text-amber-700">
                          contact@seniordiscounts.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-black">Phone</h3>
                      <p className="text-slate-700">
                        <a href="tel:+1-555-123-4567" className="text-amber-600 hover:text-amber-700">
                          (555) 123-4567
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-black">Business Hours</h3>
                      <p className="text-slate-700">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-black">Support Areas</h2>
                
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold text-black">Business Submissions</h3>
                    <p className="text-slate-700 text-sm">
                      Need help submitting a discount? We're here to assist.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-black">Technical Issues</h3>
                    <p className="text-slate-700 text-sm">
                      Experiencing problems with the website? Let us know.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-black">General Inquiries</h3>
                    <p className="text-slate-700 text-sm">
                      Questions about our service? We'd love to help.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-black">Send us a Message</h2>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-black mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  >
                    <option value="">Select a subject</option>
                    <option value="business-submission">Business Submission Help</option>
                    <option value="technical-issue">Technical Issue</option>
                    <option value="general-inquiry">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-black mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base resize-none"
                    placeholder="Please describe your inquiry or issue..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-base"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-black">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-black mb-2">How do I submit a business discount?</h3>
                  <p className="text-slate-700">
                    Visit our submit page and fill out the form with your business discount details. All submissions are reviewed before publication.
                  </p>
                </div>

                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-black mb-2">How long does it take to approve a discount?</h3>
                  <p className="text-slate-700">
                    We typically review and approve discounts within 1-3 business days. You'll receive an email notification once approved.
                  </p>
                </div>

                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-black mb-2">Can I edit my discount after submission?</h3>
                  <p className="text-slate-700">
                    Currently, discounts cannot be edited after submission. Please contact us if you need to make changes.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Is there a cost to list discounts?</h3>
                  <p className="text-slate-700">
                    No, listing discounts on our platform is completely free for businesses. We're committed to helping seniors save money.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
