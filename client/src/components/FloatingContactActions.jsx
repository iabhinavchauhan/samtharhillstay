import { useContext } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { ResortContext } from '../context/ResortContext.js'

const defaultPhoneLink = '+919804600910'
const defaultWhatsAppLink = 'https://wa.me/919804600910'

export default function FloatingContactActions() {
  const { siteData } = useContext(ResortContext)
  const contact = siteData?.contact || {}
  const rawPhone = String(contact.phoneLink || contact.phone || defaultPhoneLink)
  const phoneHref = rawPhone.startsWith('tel:') ? rawPhone : `tel:${rawPhone}`
  const whatsappHref = contact.whatsappLink || defaultWhatsAppLink

  return (
    <nav className="floating-contact-actions" aria-label="Contact Samthar Hillstay">
      <a className="floating-contact floating-contact-call" href={phoneHref}>
        <Phone aria-hidden="true" />
        <span>Call us</span>
      </a>
      <a className="floating-contact floating-contact-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
        <MessageCircle aria-hidden="true" />
        <span>WhatsApp chat</span>
      </a>
    </nav>
  )
}
